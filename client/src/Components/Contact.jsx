import { Card, Input, Button, Typography, Textarea } from "@material-tailwind/react";
import React, { useState } from 'react'
import Turnstile from "react-turnstile";
import { ToastContainer, toast, Zoom } from 'react-toastify';
import host_url from '../ServerUrl'
import 'react-toastify/dist/ReactToastify.css';
import Nav from './Nav'
import Footer from './Footer'

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function Contact() {
  const [btn, setBtn] = useState(false);
  const [btnState, setBtnState] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");
  const [token, setToken] = useState("");


  const contactUs = async () => {

    if(desc.length > 500) {
      toast.error('Description must be below 500 characters !', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Zoom,
      });
      return;
    }

    if (name.trim() == "" || email.trim() == "" || desc.trim() == "") {
      toast.error('Please enter valid data', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Zoom,
      });
      return;
    }

    if (!(isValidEmail(email))) {
      toast.error('Please enter valid email', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Zoom,
      });

      return;
    }

    if (!btn) {
      setBtn(true)
      const response = await fetch(`${host_url}/api/contact_us`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name, email: email, desc: desc, token: token })
      })

      const data = await response.json();
      if (data.message == "sent" && data.success) {

        setName("");
        setEmail("");
        setDesc("");

        toast.success('Message received', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Zoom,
        });
      } else {
        toast.error('Failed Please try again', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Zoom,
        });
      }
      setBtn(false)
    }
  }

  const tokenVerified = (e) => {
    setToken(e);
    setBtnState(false);
  }

  return (
    <>
      <Nav />

      <div className="flex justify-center">
        <ToastContainer limit={1} />
      </div>

      <Card color="transparent" shadow={false}>

        <div className="flex justify-center mt-4">
          <Typography variant="h5" color="blue-gray">
            Contact US
          </Typography>
        </div>
        <form className="mt-4 mb-2 w-80 max-w-screen-lg sm:w-96 justify-center mx-auto">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Your Name
            </Typography>
            <Input
              size="lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="name"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Your Email
            </Typography>
            <Input
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@company.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Description
            </Typography>
            <Textarea
              size="lg"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Type here"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <Turnstile
            sitekey="0x4AAAAAAAY7gub-F98ta1Xl"
            onVerify={(token) => tokenVerified(token)}
          />
          <Button className="mt-6" fullWidth onClick={contactUs} disabled={btnState}>
            CONTACT
          </Button>
        </form>
      </Card>

      <Footer />
    </>
  )
}

export default Contact


