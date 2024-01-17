import React from 'react';
import Link from 'next/link'; 
import { BsDiscord } from "react-icons/bs";
import { AiFillLinkedin, AiFillTwitterCircle } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";

const Footer: React.FunctionComponent = () => {
  return (
    <>
      <footer className='app_footer'>
        <div className='footer_text_wrap'>
          <ul>
            <li>
              <Link href="/">Help center</Link>
            </li>
          </ul>
        </div>
        <div className='footer_icn_wrap'>
          <ul>
            <li>
              <Link href="/"><FaFacebook /></Link>
            </li>
            <li>
              <Link href="/"><AiFillTwitterCircle /></Link>
            </li>
            <li>
              <Link href="/"><AiFillLinkedin /></Link>
            </li>
            <li>
              <Link href="/"><BsDiscord /></Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  )
}

export default Footer;
