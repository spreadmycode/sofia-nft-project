import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { useState } from 'react';
import Link from 'next/link'
import { useWindowSize } from '../hooks/use-window-size';

const Header = ({whyusRef, roadmapRef, benefitsRef, attributesRef, teamRef, faqRef, launchpadRef}: any) => {

  const {width, height} = useWindowSize();

  const [isMenuShowed, setIsMenuShowed] = useState(false);

  const handleClickMenu = () => {
    setIsMenuShowed(!isMenuShowed);
  }

  const handleConnectWallet = () => {
  }

  const scrollTo = (ref: any) => {
    window.scroll(
      {
        top: ref.current.offsetTop,
        behavior: "smooth",
      }
    );
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
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(whyusRef)} >
              WHY US
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(roadmapRef)} >
              ROADMAP
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(benefitsRef)} >
              BENEFITS
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(attributesRef)} >
              ATTRIBUTES
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(teamRef)} >
              TEAM
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(faqRef)} >
              FAQ
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(launchpadRef)} >
              LAUNCHPAD
            </button>
            <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none" onClick={() => scrollTo(launchpadRef)} >
              MARKETPLACE
            </button>
          </div>
          <button className="button-connect" onClick={handleConnectWallet}>
            CONNECT WALLET
          </button>
        </>
        :
        <>
          <div className="flex-grow flex justify-center items-center">
            <button className="button-connect" onClick={handleConnectWallet}>
              CONNECT WALLET
            </button>
          </div>
          <button className="inline-flex justify-center items-center pr-3" onClick={handleClickMenu} >
            <img src={'/images/icon_menu.png'} width="35" />
          </button>
        </>
      }
    </div>
    {isMenuShowed &&
      <div className="flex flex-col space-y-2 w-full theme-bg-color p-2">
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(whyusRef)} >
          WHY US
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(roadmapRef)} >
          ROADMAP
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(benefitsRef)} >
          BENEFITS
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(attributesRef)} >
          ATTRIBUTES
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(teamRef)} >
          TEAM
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(faqRef)} >
          FAQ
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(launchpadRef)} >
          LAUNCHPAD
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none header-menu-item" onClick={() => scrollTo(launchpadRef)} >
          MARKETPLACE
        </button>
      </div>
    }
  </div>;
}

export default Header;