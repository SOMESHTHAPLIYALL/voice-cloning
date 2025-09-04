import { useMediaQuery } from "react-responsive";

const FooterSection = () => {
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  return (
    <section className="footer-section">
      <img
        src="/images/footer-dip.png"
        alt="VocalForge AI wave graphic"
        className="w-full object-cover -translate-y-1"
      />

      <div className="2xl:h-[110dvh] relative md:pt-[20vh] pt-[10vh]">
        <div className="overflow-hidden z-10">
          <h1 className="general-title text-center text-milk py-5">
            #VOICECREATIVELY
          </h1>
        </div>

        {isMobile ? (
          <img
            src="/images/footer-drink.png"
            className="absolute top-0 object-contain"
            alt="VocalForge AI mobile illustration"
          />
        ) : (
          <video
            src="/videos/footer.mp4"
            autoPlay
            playsInline
            muted
            className="absolute top-0 object-contain mix-blend-lighten"
            alt="VocalForge AI demo video"
          />
        )}

        <div className="flex-center gap-5 relative z-10 md:mt-20 mt-5">
          <div className="social-btn">
            <img src="./images/yt.svg" alt="YouTube" />
          </div>
          <div className="social-btn">
            <img src="./images/insta.svg" alt="Instagram" />
          </div>
          <div className="social-btn">
            <img src="./images/tiktok.svg" alt="TikTok" />
          </div>
        </div>

        <div className="mt-40 md:px-10 px-5 flex gap-10 md:flex-row flex-col justify-between text-milk font-paragraph md:text-lg font-medium">
          <div className="flex items-center md:gap-16 gap-5">
            <div>
              <p>Voice Packs</p>
            </div>
            <div>
              <p>Creator Studio</p>
              <p>Meme Generator</p>
              <p>Voice Artists</p>
            </div>
            <div>
              <p>Company</p>
              <p>Contact</p>
              <p>Voice Lab</p>
            </div>
          </div>

          <div className="md:max-w-lg">
            <p>
              Get Early Access to New Voice Packs, Creative Tools, and Exclusive
              Features!
            </p>
            <div className="flex justify-between items-center border-b border-[#D9D9D9] py-5 md:mt-10">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full placeholder:font-sans placeholder:text-[#999999]"
              />
              <img src="/images/arrow.svg" alt="Submit" />
            </div>
          </div>
        </div>

        <div className="copyright-box">
          <p>Copyright © 2025 VOCALAURA AI - All Rights Reserved</p>
          <div className="flex items-center gap-7">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;
