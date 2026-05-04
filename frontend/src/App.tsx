import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnalyzerPage } from "./pages/AnalyzerPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyzerPage />
    </QueryClientProvider>
  );
}
