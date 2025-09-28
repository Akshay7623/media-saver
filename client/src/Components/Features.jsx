import { Typography } from "@material-tailwind/react";
import FeatureCard from '../Components/FeatureCard';
import MultipleImg from '../assets/arrows.png';
import UserUI from '../assets/image.png';
import hq from '../assets/Hq.png';
import platfrom from '../assets/platform.png';
import software from '../assets/software.png';
import speed from '../assets/speed.png';

const Features = () => {
  return (
    <div className='px-2' id="features">
      <Typography className="px-2 mt-10 text-center" variant='h4'>Features</Typography>
      <div className='flex flex-row flex-wrap justify-center gap-4'>
        <FeatureCard img={MultipleImg} title="Multiple Format Support" description="Our platform offers extensive support for various video and audio formats, allowing you to convert YouTube videos into MP4, 3GP, WEBM, MP3, OGG, and M4A. This flexibility ensures seamless enjoyment of your downloaded content on any device, whether it’s a PC, tablet, iPhone, or Android smartphone." />
        <FeatureCard img={UserUI} title="High-Quality Video Downloads" description="Our platform lets you download YouTube videos in multiple resolutions, including 720p, 1080p, 2K, and even 4K. This ensures you can experience your content in the highest quality available, exactly as the creator intended." />
        <FeatureCard img={hq} title="User-Friendly Interface" description="[website name] is built for simplicity and ease of use. With its user-friendly interface, you can quickly download and convert YouTube videos with just a few clicks, no technical skills or expertise required." />
        <FeatureCard img={platfrom} title="No Software Installation Required" description="Unlike many other YouTube video downloaders and converters, [website name] is an online tool that doesn't require any software installation. Just visit our website, enter the video URL, and begin downloading your favorite YouTube content." />
        <FeatureCard img={software} title="No Software Installation Required" description="We know your time is valuable, which is why we've optimized our platform for the fastest download speeds. Say goodbye to long waits and enjoy instant video downloads." />
        <FeatureCard img={speed} title="Compatibility with Multiple Platforms" description="[website name] is compatible with multiple platforms, including Windows, macOS, iOS, and Android, ensuring you can use it on your preferred device and operating system." />
      </div>
    </div>
  )
}

export default Features