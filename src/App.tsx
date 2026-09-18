import Hero from "./sections/Hero";
import Cost from "./sections/Cost";
import TryIt from "./sections/TryIt";
import Flow from "./sections/Flow";
import WhyNow from "./sections/WhyNow";
import Faq from "./sections/Faq";
import WhyMe from "./sections/WhyMe";
import Ask from "./sections/Ask";
import TopBar from "./sections/TopBar";
import Footer from "./sections/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <TopBar />
      <main>
        <Hero />
        <Cost />
        <TryIt />
        <Flow />
        <WhyNow />
        <Faq />
        <WhyMe />
        <Ask />
      </main>
      <Footer />
    </div>
  );
}
