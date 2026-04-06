import { HeroSection } from "../components/ui/hero-section";


const Home = () => {
    return (
        <div className="min-h-[100vh] flex flex-col bg-background">
            <main className="flex-1">
                <HeroSection />
            </main>
        </div>
    );
};

export default Home;
