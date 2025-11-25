import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ChatInterface />
    </main>
  );
}
