"""Provision private enquiry storage and owner email notifications on existing AWS hosting.

Run with python3 scripts/setup-enquiries.py. Uses AWS profile mine and the
existing local Gmail configuration; never prints or writes secrets to the repo.
"""
import json
import os
import shlex
import subprocess
import tempfile
import time
import zipfile
from pathlib import Path

REGION = "ap-south-1"
TABLE = "rohitraj-tech-enquiries"
FUNCTION = "rohitraj-tech-enquiry-notifier"


def aws(*args, allow_failure=False):
    result = subprocess.run(["aws", "--profile", "mine", "--region", REGION, *args], capture_output=True, text=True)
    if result.returncode:
        if allow_failure:
            return None
        # AWS errors contain service diagnostics, never our secret input.
        raise RuntimeError(result.stderr[:500])
    return json.loads(result.stdout) if result.stdout.strip() else {}


def main():
    account = aws("sts", "get-caller-identity")["Account"]
    existing = aws("dynamodb", "describe-table", "--table-name", TABLE, allow_failure=True)
    if not existing:
        aws("dynamodb", "create-table", "--table-name", TABLE, "--attribute-definitions", "AttributeName=id,AttributeType=S", "--key-schema", "AttributeName=id,KeyType=HASH", "--billing-mode", "PAY_PER_REQUEST", "--stream-specification", "StreamEnabled=true,StreamViewType=NEW_IMAGE")
        aws("dynamodb", "wait", "table-exists", "--table-name", TABLE)
    table = aws("dynamodb", "describe-table", "--table-name", TABLE)["Table"]
    ttl = aws("dynamodb", "describe-time-to-live", "--table-name", TABLE)["TimeToLiveDescription"]
    if ttl.get("TimeToLiveStatus") == "DISABLED":
        aws("dynamodb", "update-time-to-live", "--table-name", TABLE, "--time-to-live-specification", "Enabled=true,AttributeName=expires_at")
    secret = aws("secretsmanager", "describe-secret", "--secret-id", "rohitraj-tech/enquiry-smtp", allow_failure=True)
    if not secret:
        env = {}
        for line in (Path.home() / ".freelance-hunt" / ".env").read_text().splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                key, value = line.split("=", 1)
                if key.strip() in ["GMAIL_USER", "GMAIL_APP_PASSWORD"]:
                    env[key.strip()] = " ".join(shlex.split(value))
        if env.get("GMAIL_USER") != "rohitgupta2432@gmail.com" or not env.get("GMAIL_APP_PASSWORD"):
            raise RuntimeError("Owner Gmail SMTP configuration is missing.")
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as handle:
            os.chmod(handle.name, 0o600)
            json.dump({"username": env["GMAIL_USER"], "password": env["GMAIL_APP_PASSWORD"]}, handle)
            secret_file = handle.name
        try:
            secret = aws("secretsmanager", "create-secret", "--name", "rohitraj-tech/enquiry-smtp", "--secret-string", "file://" + secret_file)
        finally:
            os.unlink(secret_file)
    secret_arn = secret["ARN"]
    api_policy = {"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:DescribeTable"], "Resource": table["TableArn"]}]}
    aws("iam", "put-role-policy", "--role-name", "rohitraj-tech-amplify-compute", "--policy-name", "enquiries-storage", "--policy-document", json.dumps(api_policy))
    role_name = FUNCTION
    role = aws("iam", "get-role", "--role-name", role_name, allow_failure=True)
    if not role:
        role = aws("iam", "create-role", "--role-name", role_name, "--assume-role-policy-document", json.dumps({"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}))
    queue = aws("sqs", "create-queue", "--queue-name", FUNCTION + "-failures")
    queue_arn = aws("sqs", "get-queue-attributes", "--queue-url", queue["QueueUrl"], "--attribute-names", "QueueArn")["Attributes"]["QueueArn"]
    log_arn = f"arn:aws:logs:{REGION}:{account}:log-group:/aws/lambda/{FUNCTION}:*"
    aws("logs", "create-log-group", "--log-group-name", "/aws/lambda/" + FUNCTION, allow_failure=True)
    aws("logs", "put-retention-policy", "--log-group-name", "/aws/lambda/" + FUNCTION, "--retention-in-days", "14")
    policy = {"Version": "2012-10-17", "Statement": [
        {"Effect": "Allow", "Action": ["dynamodb:DescribeStream", "dynamodb:GetRecords", "dynamodb:GetShardIterator"], "Resource": table["LatestStreamArn"]},
        {"Effect": "Allow", "Action": "dynamodb:ListStreams", "Resource": table["TableArn"] + "/stream/*"},
        {"Effect": "Allow", "Action": ["dynamodb:GetItem", "dynamodb:UpdateItem"], "Resource": table["TableArn"]},
        {"Effect": "Allow", "Action": "secretsmanager:GetSecretValue", "Resource": secret_arn},
        {"Effect": "Allow", "Action": "sqs:SendMessage", "Resource": queue_arn},
        {"Effect": "Allow", "Action": ["logs:CreateLogStream", "logs:PutLogEvents"], "Resource": log_arn},
    ]}
    aws("iam", "put-role-policy", "--role-name", role_name, "--policy-name", "enquiry-notifications", "--policy-document", json.dumps(policy))
    with tempfile.NamedTemporaryFile(suffix=".zip") as bundle:
        with zipfile.ZipFile(bundle.name, "w", zipfile.ZIP_DEFLATED) as archive:
            archive.write(Path(__file__).with_name("enquiry-notifier.py"), "notifier.py")
        current = aws("lambda", "get-function", "--function-name", FUNCTION, allow_failure=True)
        if current:
            aws("lambda", "update-function-code", "--function-name", FUNCTION, "--zip-file", "fileb://" + bundle.name)
            aws("lambda", "wait", "function-updated-v2", "--function-name", FUNCTION)
        else:
            # IAM role propagation can lag role creation by a few seconds.
            for attempt in range(6):
                created = aws("lambda", "create-function", "--function-name", FUNCTION, "--runtime", "python3.12", "--handler", "notifier.handler", "--role", role["Role"]["Arn"], "--zip-file", "fileb://" + bundle.name, "--timeout", "30", "--memory-size", "128", "--environment", json.dumps({"Variables": {"SMTP_SECRET_ARN": secret_arn}}), allow_failure=True)
                if created:
                    break
                time.sleep(5)
            else:
                raise RuntimeError("Could not create the notifier function.")
            aws("lambda", "wait", "function-active-v2", "--function-name", FUNCTION)
    # New AWS accounts may have only ten unreserved executions, which cannot
    # be reduced further. Stream batches still run serially within each shard.
    aws("lambda", "put-function-concurrency", "--function-name", FUNCTION, "--reserved-concurrent-executions", "1", allow_failure=True)
    mappings = aws("lambda", "list-event-source-mappings", "--function-name", FUNCTION)["EventSourceMappings"]
    if not mappings:
        aws("lambda", "create-event-source-mapping", "--function-name", FUNCTION, "--event-source-arn", table["LatestStreamArn"], "--starting-position", "TRIM_HORIZON", "--batch-size", "1", "--maximum-retry-attempts", "10", "--maximum-record-age-in-seconds", "86400", "--bisect-batch-on-function-error", "--function-response-types", "ReportBatchItemFailures", "--destination-config", json.dumps({"OnFailure": {"Destination": queue_arn}}), "--filter-criteria", json.dumps({"Filters": [{"Pattern": json.dumps({"eventName": ["INSERT"], "dynamodb": {"NewImage": {"id": {"S": [{"prefix": "enquiry:"}]}}}})}]}))
    print(json.dumps({"table": TABLE, "notifier": FUNCTION, "owner_notifications": "rohitgupta2432@gmail.com", "retention_days": 90}))


if __name__ == "__main__":
    main()
