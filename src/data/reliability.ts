import type { CardConfig } from '@/types/reliability';

export const cardConfigs: CardConfig[] = [
    {
        key: "observability",
        icon: "📊",
        route: "/reliability/observability",
        accentColor: "#A02709",
    },
    {
        key: "loadTesting",
        icon: "⚡",
        route: "/reliability/load-testing",
        accentColor: "#A02709",
    },
    {
        key: "apiTesting",
        icon: "🔗",
        route: "/reliability/api-testing",
        accentColor: "#A02709",
    },
    {
        key: "kafkaTesting",
        icon: "📨",
        route: "/reliability/kafka-testing",
        accentColor: "#A02709",
    },
];
