import { Accordion, AccordionItem } from "@nextui-org/react";
import { Typography } from '@material-tailwind/react'

export default function App() {

  return (
    <div id="faq">
      <Typography className="px-2 my-8  text-center" variant='h4'>FAQ</Typography>


      <Accordion variant="splitted" className="">

        <AccordionItem key="1" aria-label="Accordion 1" title={<Typography variant="h6"> What is SSYouTube and What Are Its Key Features?</Typography>}>
          <Typography variant="paragraph" color="gray">
            SSYouTube is a free online tool engineered for downloading YouTube videos in various formats and resolutions. Key features include rapid downloads, high-quality video and audio, and the ability to save videos for offline viewing.
          </Typography>
        </AccordionItem>

        <AccordionItem key="2" aria-label="Accordion 2" title={<Typography variant="h6">How Can I Download a YouTube Video Using SSYouTube?</Typography>}>
          <Typography variant="paragraph" color="gray">
            To download a YouTube video with SSYouTube, copy the video URL and paste it into the search bar on the SSYouTube website. Choose your preferred format and resolution, then click the download button. It's quick and straightforward!
          </Typography>
        </AccordionItem>

        <AccordionItem key="3" aria-label="Accordion 3" title={<Typography variant="h6"> What File Formats Does SSYouTube Support for Video Downloads?</Typography>}>
          <Typography variant="paragraph" color="gray">
            SSYouTube supports a wide range of video and audio formats, including MP4, AVI, FLV, MOV, WMV, and more. You can also select different resolutions such as 720p or 1080p to match your preferences.
          </Typography>
        </AccordionItem>

        <AccordionItem key="4" aria-label="Accordion 4" title={<Typography variant="h6"> Is SSYouTube a Secure Platform to Use?</Typography>}>
          <Typography variant="paragraph" color="gray">
            Yes, SSYouTube is a secure platform. We prioritize user privacy and security, ensuring that no personal information is stored. Our site undergoes regular updates to safeguard against viruses and malware.
          </Typography>
        </AccordionItem>

      </Accordion>

    </div>
  );
}