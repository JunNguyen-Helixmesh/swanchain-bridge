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
              <Link href="/"><a>Help center</a></Link>
            </li>
          </ul>
        </div>
        <div className='footer_icn_wrap'>
          <ul>
            <li>
              <Link href="/"><a><FaFacebook /></a></Link>
            </li>
            <li>
              <Link href="/"><a><AiFillTwitterCircle /></a></Link>
            </li>
            <li>
              <Link href="/"><a><AiFillLinkedin /></a></Link>
            </li>
            <li>
              <Link href="/"><a><BsDiscord /></a></Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  )
}

export default Footer;
