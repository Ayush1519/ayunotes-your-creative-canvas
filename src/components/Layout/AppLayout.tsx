import { Sidebar } from "../Sidebar/Sidebar";
import { MainContent } from "../MainContent/MainContent";
import { Header } from "../Header/Header";

export const AppLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <MainContent />
      </div>
    </div>
  );
};
