"""DynamoDB stream handler: notify the site owner after an enquiry is saved."""
import json
import os
import smtplib
from email.message import EmailMessage

import boto3
from boto3.dynamodb.types import TypeDeserializer

secrets = boto3.client("secretsmanager")
table = boto3.resource("dynamodb").Table("rohitraj-tech-enquiries")
credentials = None
deserialize = TypeDeserializer()


def handler(event, context):
    global credentials
    failures = []
    for record in event.get("Records", []):
        if record.get("eventName") != "INSERT":
            continue
        raw = record["dynamodb"].get("NewImage", {})
        item = {key: deserialize.deserialize(value) for key, value in raw.items()}
        if not item.get("id", "").startswith("enquiry:"):
            continue
        try:
            # Email delivery is at least once. A saved marker avoids ordinary
            # stream retries sending a second copy after a successful delivery.
            current = table.get_item(Key={"id": item["id"]}, ConsistentRead=True).get("Item", {})
            if not current or current.get("notification_sent"):
                continue
            if credentials is None:
                credentials = json.loads(secrets.get_secret_value(SecretId=os.environ["SMTP_SECRET_ARN"])["SecretString"])
            owner = credentials["username"]
            message = EmailMessage()
            message["From"] = owner
            message["To"] = owner
            message["Reply-To"] = item["email"]
            message["Subject"] = "Website enquiry: " + " ".join(item["name"].split())[:120]
            message.set_content(
                f"Name: {item['name']}\nEmail: {item['email']}\n"
                f"Page: {item['source_path']}\nReceived: {item['received_at']}\n\n"
                f"{item['message']}\n\nReceipt: {item['id']}\n"
            )
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as smtp:
                smtp.login(owner, credentials["password"])
                smtp.send_message(message)
            table.update_item(Key={"id": item["id"]}, UpdateExpression="SET notification_sent = :sent", ExpressionAttributeValues={":sent": True})
        except Exception as error:
            # Do not log the submitted brief, email address or credentials.
            print(json.dumps({"event": "enquiry_notification_failed", "error_type": type(error).__name__}))
            failures.append({"itemIdentifier": record["dynamodb"]["SequenceNumber"]})
    return {"batchItemFailures": failures}
