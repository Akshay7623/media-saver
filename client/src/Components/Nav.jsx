import React, { useState } from "react";
import { Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenuItem, NavbarMenu, NavbarContent, NavbarItem } from "@nextui-org/react";
import { Link, useNavigate } from "react-router-dom";

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const hanldeFaq = () => {
        if (location.pathname !== "/") {
            navigate("/")
        } else {
            const e = document.getElementById("faq");
            setIsMenuOpen(false)
            window.scrollTo({
                top: e.offsetTop,
                behavior: 'smooth'
            })
        }
    }

    const Home = () => {
        if (location.pathname !== "/") {
            navigate("/")
        } else {
            const e = document.getElementById("input");
            setIsMenuOpen(false)
            window.scrollTo({
                top: e.offsetTop - 86,
                behavior: 'smooth'
            })
        }
    }

    const hanldeFeatue = () => {
        if (location.pathname !== "/") {
            navigate("/")
        } else {
            const e = document.getElementById("features");
            setIsMenuOpen(false)
            window.scrollTo({
                top: e.offsetTop - 64,
                behavior: 'smooth'
            })
        }
    }

    const menuItems = [
        ["Home", Home],
        ["Features", hanldeFeatue],
        ["FAQ", hanldeFaq],
        ["Download", Home],
        ["Youtube", Home],
        ["Contact us",()=>navigate("/contact")],
        ["About us",()=>navigate("/about")],
        ["Terms & Conditions", ()=>navigate("/t-and-c")],
        ["Privacy policy",()=>navigate("/privacy-policy")],
    ];

    return (
        <Navbar
            isBordered
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            className="border-[#DCDCDC] border-1 border-solid rounded"
        >
            <NavbarContent className="sm:hidden" justify="start">
                <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
            </NavbarContent>

            <NavbarContent className="sm:hidden pr-3" justify="center">
                <NavbarBrand>
                    <p className="font-bold text-inherit">Vid Saver</p>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarBrand>
                    <p className="font-bold text-inherit">Vid Saver</p>
                </NavbarBrand>
                <NavbarItem>
                    <Link to="/">
                        Home
                    </Link>
                </NavbarItem>
                <NavbarItem >
                    <Link to="/" >
                        Youtube
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" to="/">
                        Facebook
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" to="/contact">
                        Contact
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" to="/about">
                        About
                    </Link>
                </NavbarItem>
            </NavbarContent>


            <NavbarMenu>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item}-${index}`}>
                        <div
                            className="w-ful cursor-pointer"
                            onClick={item[1]}
                            size="lg"
                        >
                            {item[0]}
                        </div>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}