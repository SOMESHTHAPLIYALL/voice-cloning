import Title from "../components/Title";
import Slider from "../components/Slider";

const VoiceSection = () => {
  return (
    <section className="flavor-section">
      <div className="h-full flex lg:flex-row flex-col items-center relative">
        <div className="lg:w-[57%] flex-none h-80 lg:h-full md:mt-20 xl:mt-0">
          <Title />
        </div>
        <div className="h-full">
          <Slider />
        </div>
      </div>
    </section>
  );
};

export default VoiceSection;
