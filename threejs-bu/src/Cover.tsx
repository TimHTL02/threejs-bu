import { motion } from "framer-motion";
import { SparklesCore } from "./ui/sparkles";
import { AnimatedTooltip } from "./ui/animated-tooltip";

const people = [
  {
    id: 1,
    name: "Jacky Wu",
    designation: "Game Programmer",
    image:
      "./images/jacky-wu.png",
  },
  {
    id: 2,
    name: "Robert Johnson",
    designation: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
];

export function Cover() {

  return (
    <div className=" relative h-full w-full bg-[#8FB1D6] flex flex-col items-center justify-center overflow-hidden">
      
    <p className=" mb-5 pl-5 text-white font-mono text-xl">made by</p>

      <div className="flex flex-row items-center justify-center mb-10 w-full">
        <AnimatedTooltip items={people} />
      </div>

      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20 select-none">
        Untitled Game
      </h1>
      <div className="w-[40rem] h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-zinc-200 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-zinc-200 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-[#8FB1D6] [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>

        <div className=" w-full inline-flex justify-center items-center">
          <motion.div
            className=" text-2xl font-semibold p-1 pl-2 pr-2 border-2 border-white rounded-md select-none text-white cursor-pointer"
            initial={{ scale: 1, rotateZ: 0, color: "#ffffff" }}
            whileHover={{ scale: 1.5, rotateZ: 20, color: "#000000" }}
            transition={{
              type: "spring",
              bounce: 0.6,
            }}
            whileTap={{ scale: 0.8, rotateZ: 0 }}
            onClick={() =>{

            }}
          >
            Play
          </motion.div>
        </div>
      </div>
    </div>
  );
}
