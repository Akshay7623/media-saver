import { useState } from "react";
import {
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { ToastContainer } from "react-toastify";
import host_url from "../ServerUrl";
import { RotatingLines } from "react-loader-spinner";
import "react-toastify/dist/ReactToastify.css";
import Error from "../Components/Toasts/Error";
import { Link, useNavigate } from "react-router-dom";

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

const InputBox = () => {
  const [url, setUrl] = useState("");
  const [input, setInput] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [disable, setDisable] = useState(false);
  const [videoDetails, setVideoDetails] = useState({ title: "", duration: "" });
  const [isFocused, setIsFocused] = useState(false);
  const [quality, setQaulity] = useState("");
  const [thumbnail, setThumb] = useState(null);
  const [facebook, setFacebook] = useState([]);
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [customVideo, setCustomVideo] = useState("");
  const handleOpen = () => setOpen(!open);

  const navigate = useNavigate();

  const setDefault = () => {
    setTwitter("");
    setInstagram("");
    setFacebook("");
    setThumb(null);
    setQaulity("");
    setCustomVideo("");
    setVideoDetails({ title: "", duration: "" });
    setOptions([]);
  };

  const settingForYT = (data) => {
    const formats = data.formats.sort(
      (a, b) => parseInt(a.split("p")[0]) - parseInt(b.split("p")[0])
    );
    setThumb(data.img);
    setOptions(formats);
    setVideoDetails({ title: data.title, duration: data.duration });
    setQaulity(formats[Math.floor(formats.length / 2)]);
  };

  const changeQaulity = (e) => {
    setQaulity(e);
  };

  const hanldeDownload = () => {
    if (downloadURL != "") {
      const fileUrl = downloadURL;
      const fileName = "downloaded-file-name.mp4";
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setOpen(false);
    }
  };

  const hanldeOpenModal = async (promise) => {
    setDisable(false);
    setOpen(true);
    promise
      .then((res) => res.json())
      .then((data) => {
        if (data.final_url) {
          location.href = data.final_url;
          setOpen(false);
        } else {
          setDownloadURL(data.downloadUrlX);
        }
      });
  };

  const handleFBDownload = (type) => {
    if (type == 1) {
      const fileUrl = facebook[0];
      const fileName = "downloaded-file-name.mp4";
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const fileUrl = facebook[1];
      const fileName = "downloaded-file-name.mp4";
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const hanldeInsta = () => {
    if (instagram != "") {
      const fileUrl = instagram;
      const fileName = "downloaded-file-name.mp4";
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Error("Please refresh page and try again");
    }
  };

  const downloadYT = async () => {
    if (quality == "") {
      Error("Please fetch video");
    } else {
      const promise = fetch(`${host_url}/api/download_video/yt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: quality, url: url }),
      });
      hanldeOpenModal(promise);
    }
  };

  const getVideoInfo = () => {
    if (disable) {
      return;
    }

    setDownloadURL("");
    setDisable(true);

    if (isValidURL(url)) {
      fetch(`${host_url}/api/get_details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
      })
        .then((res) => res.json())
        .then((data) => {
          setDisable(false);
          setDefault();
          if (data.type === "YT") {
            settingForYT(data);
          } else if (data.type === "FB") {
            if (data.message === "success") {
              setFacebook([data.Normal_video, data.HD]);
            } else {
              Error("Some server error please try again");
            }
          } else if (data.type === "IN") {
            if (data.message == "success") {
              setInstagram(data.url.url);
            } else {
              Error("Some server error please try again");
            }
          } else if (data.type === "TW") {
            if (data.message === "success") {
              setTwitter(data.data.url[0].hd);
            } else {
              Error("Some server error please try again");
            }
          } else if (data.type === "CU") {
            setCustomVideo(data.url);
          }
        });
    } else {
      setInput(true);
      setDisable(false);
      Error("Please Enter Valid URL");
    }
  };

  const hanldeTwitter = () => {
    if (twitter != "") {
      const fileUrl = twitter;
      const fileName = "downloaded-file-name.mp4";
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Error("Please refresh page and try again");
    }
  };

  const hanldeCustomVideo = () => {
    if (customVideo !== "") {
      const fileUrl = customVideo;
      const fileName = "downloaded-file-name.mp4";
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Error("Please refresh page and try again");
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setInput(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="px-2" id="input">
      <Dialog
        open={open}
        handler={handleOpen}
        animate={{
          mount: { scale: 1, opacity: 1 },
          unmount: { scale: 0.9, opacity: 0 },
        }}
        dismiss={{ enabled: false, outsidePress: false }}
      >
        <DialogHeader className="text-xl">Download</DialogHeader>

        {downloadURL == "" ? (
          <div>
            <DialogBody className="flex justify-center">
              <RotatingLines
                visible={true}
                height="96"
                width="96"
                color="grey"
                strokeWidth="5"
                animationDuration="0.75"
                ariaLabel="rotating-lines-loading"
                wrapperStyle={{}}
                strokeColor="#616161"
                wrapperClass=""
              />
            </DialogBody>
            <p className="flex justify-center"> Please wait...</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <img src={thumbnail} alt="Thumbnail" />
          </div>
        )}

        <DialogFooter className="flex justify-center">
          <Button
            variant="outlined"
            color="red"
            onClick={hanldeDownload}
            className="mr-1"
          >
            <span>Download</span>
          </Button>
        </DialogFooter>
      </Dialog>

      <Typography className="mt-5 mx-auto justify-center flex" variant="h5">
        Download Video
      </Typography>

      <div className="flex justify-center">
        <ToastContainer limit={1} />
      </div>

      <div className="bg-[#212121] rounded-md shadow-sm p-2 mt-2 py-3 glass_effect">
        <Typography className="text-center text-gray-400" variant="small">
          Download videos from <span className="text-red-400">YouTube</span>,{" "}
          <span className="text-blue-400">Facebook</span>,{" "}
          <span className="text-orange-400">Instagram</span>,{" "}
          <span className="text-gray-700">Twitter</span> and other websites.{" "}
        </Typography>
        <div className="max-w-72 mx-auto my-5 justify-center">
          <Input
            className="input_border_white"
            onFocus={handleFocus}
            size="lg"
            label={!isFocused ? "Enter video URL" : ""}
            onBlur={handleBlur}
            onChange={(e) => setUrl(e.target.value)}
            value={url}
            error={input}
            placeholder="https://www.youtube.com/watch?v=videoId"
          />
        </div>
      </div>

      <div className="max-w-72 mx-auto my-5 justify-center">
        {thumbnail ? (
          <div className="my-3">
            <div className="font-bold my-2 text-sm">{videoDetails.title}</div>
            <img src={thumbnail} alt="thumbnail" />
            <div className="my-2 text-sm">{videoDetails.duration}</div>
            <div className="mt-3">
              <Select
                label="Select quality"
                value={quality}
                onChange={(e) => changeQaulity(e.toString())}
              >
                {options.map((e) => {
                  return (
                    <Option key={e} value={e}>
                      {e}
                    </Option>
                  );
                })}
              </Select>
            </div>
            <Button
              className="mt-2"
              size="md"
              onClick={downloadYT}
              variant="outlined"
            >
              DOWNLOAD
            </Button>
          </div>
        ) : (
          <></>
        )}

        {instagram != "" ? (
          <div className="my-3">
            <video width="320" height="240" controls>
              <source src={instagram} type="video/mp4" />
            </video>
            <Button
              className="mt-2"
              size="md"
              onClick={hanldeInsta}
              variant="outlined"
            >
              DOWNLOAD
            </Button>
          </div>
        ) : (
          <></>
        )}

        {twitter ? (
          <div className="my-3">
            <video width="320" height="240" controls>
              <source src={twitter} type="video/mp4" />
            </video>
            <Button
              className="mt-2"
              size="md"
              onClick={hanldeTwitter}
              variant="outlined"
            >
              DOWNLOAD
            </Button>
          </div>
        ) : (
          <></>
        )}

        {customVideo !== "" ? (
          <div className="my-3">
            <video width="320" height="240" controls>
              <source src={customVideo} type="video/mp4" />
            </video>
            <Button
              className="mt-2"
              size="md"
              onClick={hanldeCustomVideo}
              variant="outlined"
            >
              DOWNLOAD
            </Button>
          </div>
        ) : (
          <></>
        )}

        {facebook[0] ? (
          <div className="flex justify-evenly">
            <Button
              className="mt-2"
              size="md"
              onClick={() => handleFBDownload(1)}
              variant="outlined"
            >
              Normal
            </Button>
            <Button
              className="mt-2"
              size="md"
              onClick={() => handleFBDownload(2)}
              variant="outlined"
            >
              HD Video
            </Button>
          </div>
        ) : (
          <></>
        )}

        <Button className="mt-2" size="md" onClick={getVideoInfo}>
          {disable ? "Loading" : "GET VIDEO"}
        </Button>
        <Typography className="my-3" variant="small">
          By downloading this YouTube video, you agree to the{" "}
          <span className="cursor-auto text-[#2196f3]">
            <Link to="/t-and-c">Usage Guidelines.</Link>
          </span>{" "}
        </Typography>
      </div>
    </div>
  );
};

export default InputBox;
