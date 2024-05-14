import React from 'react'
import Link from 'next/link'
import { BsDiscord } from 'react-icons/bs'
import { AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai'
import { FaFacebook } from 'react-icons/fa'

const Footer: React.FunctionComponent = () => {
  return (
    <>
      <footer className="app_footer">
        <div className="footer_text_wrap">
          <ul>
            <li>
              <Link
                href="https://discord.gg/swanchain"
                target="_blank"
                rel="noopener noreferrer"
              >
                Help center
              </Link>
            </li>
            <li>
              <span>v0.1.0</span>
            </li>
          </ul>
        </div>
        <div className="footer_icn_wrap">
          <ul>
            {/* <li>
              <Link href="/">
                <FaFacebook />
              </Link>
            </li> */}
            <li>
              <Link
                href="https://twitter.com/swan_chain"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AiFillTwitterCircle />
              </Link>
            </li>
            {/* <li>
              <Link href="https://ca.linkedin.com/company/swancloud">
                <AiFillLinkedin />
              </Link>
            </li> */}
            <li>
              <Link
                href="https://discord.gg/swanchain"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsDiscord />
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  )
}

export default Footer
