
import { StandaloneChatbot } from "@/components/StandaloneChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to my page</h1>
      
      <StandaloneChatbot 
        webhookUrl="https://your-webhook-url.com"
        title="Customer Support"
        primaryColor="#ec4899"
        position="bottom-right"
      />
    </div>
  );
};

export default Index;
