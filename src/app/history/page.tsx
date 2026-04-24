import HistoryPageClient from "@/components/history/history-page-client";
import { historyRecords } from "../../../lib/mock/history";

export default function HistoryPage() {
  return <HistoryPageClient records={historyRecords} />;
}
