
import { StandaloneChatbot } from "@/components/StandaloneChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to my page</h1>
      
      <StandaloneChatbot 
        webhookUrl="https://alpharc.app.n8n.cloud/webhook/9b07fb75-bc10-4c31-ae17-2055bbcc5018"
        title="Customer Support"
        primaryColor="#ec4899"
        position="bottom-right"
      />
    </div>
  );
};

export default Index;
