import { HeroSection } from "@/components/ui/hero-section";
import Navbar from "@/components/Navbar";

const Home = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar variant="auth" />
            <main className="flex-1">
                <HeroSection />
            </main>
        </div>
    );
};

export default Home;
