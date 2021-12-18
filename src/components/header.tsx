import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useState } from 'react';
import Link from 'next/link';
import { useWindowSize } from '../hooks/use-window-size';
import { useLocalStorage } from '@solana/wallet-adapter-react';

const Header = ({whyusRef, roadmapRef, benefitsRef, attributesRef, teamRef, faqRef, mintRef}: any) => {

  const {width, height} = useWindowSize();

  const [isMenuShowed, setIsMenuShowed] = useState(false);
  const [tag, setTag] = useLocalStorage("TAG", "");

  const handleClickMenu = () => {
    setIsMenuShowed(!isMenuShowed);
  }

  const scrollTo = (ref: any, tag: string) => {
    if (ref == undefined || ref == null) {
      setTag(tag);
      window.location.href = '/';
    } else {
      window.scroll(
        {
          top: ref.current.offsetTop,
          behavior: "smooth",
        }
      );
    }
    
    if (width <= 1280) handleClickMenu();
  }

  return <div className="theme-header theme-bg-color md:px-10 w-full">
    <div className="w-full flex flex-row justify-center items-center md:space-x-8">
      <div className="pl-3 md:pl-0">
        <Link href="/"><img src={'/images/logo.png'} width={(width > 768) ? '100px' : '70px'} className="cursor-pointer" /></Link>
      </div>
      {width > 1280 ?
        <>
          <div className="flex flex-row justify-between space-x-8 items-center">
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(whyusRef, 'WHYUS')} >
              WHY US
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(roadmapRef, 'ROADMAP')} >
              ROADMAP
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(benefitsRef, 'BENEFITS')} >
              BENEFITS
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(attributesRef, 'ATTRIBUTES')} >
              ATTRIBUTES
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(teamRef, 'TEAM')} >
              TEAM
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(faqRef, 'FAQ')} >
              FAQ
            </button>
            <Link href="/launchpad">
              <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" >
                LAUNCHPAD
              </button>
            </Link>
            {/* <Link href="/marketplace">
              <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" >
                MARKETPLACE
              </button>
            </Link> */}
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(mintRef, 'MINT')} >
              MINT
            </button>
          </div>
          <WalletMultiButton className="button-connect" />
        </>
        :
        <>
          <div className="flex-grow flex justify-center items-center">
            <WalletMultiButton className="button-connect" />
          </div>
          <button className="inline-flex justify-center items-center pr-3" onClick={handleClickMenu} >
            <img src={'/images/icon_menu.png'} width="35" />
          </button>
        </>
      }
    </div>
    {isMenuShowed &&
      <div className="flex flex-col space-y-2 w-full theme-bg-color p-2">
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(whyusRef, 'WHYUS')} >
          WHY US
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(roadmapRef, 'ROADMAP')} >
          ROADMAP
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(benefitsRef, 'BENEFITS')} >
          BENEFITS
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(attributesRef, 'ATTRIBUTES')} >
          ATTRIBUTES
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(teamRef, 'TEAM')} >
          TEAM
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(faqRef, 'FAQ')} >
          FAQ
        </button>
        <Link href="/launchpad">
          <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" >
            LAUNCHPAD
          </button>
        </Link>
        <Link href="/marketplace">
          <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" >
            MARKETPLACE
          </button>
        </Link>

        <div className="grid grid-cols-8 gap-6 pt-5">
          <div className="col-span-1"></div>
          <div className="col-span-1"></div>
          <a href="https://mobile.twitter.com/PandaWarriorNFT" className="inline-flex text-center justify-center items-center">
            <img src={'/images/icon_twitter.png'} />
          </a>
          <a href="https://discord.com/invite/EaefjHZJKH" className="inline-flex text-center justify-center items-center">
            <img src={'/images/icon_discord.png'} />
          </a>
          <a href="https://www.instagram.com/pandawarriors_nft/" className="inline-flex text-center justify-center items-center">
            <img src={'/images/icon_instagram.png'} />
          </a>
          <a href="https://vm.tiktok.com/ZSeBEyjcy/" className="inline-flex text-center justify-center items-center">
            <img src={'/images/icon_tiktok.png'} />
          </a>
          <div className="col-span-1"></div>
          <div className="col-span-1"></div>
        </div>
      </div>
    }
  </div>;
}

export default Header;