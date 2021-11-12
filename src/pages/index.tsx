import Head from 'next/head'
import { Fragment, useState, ChangeEvent, useRef, useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { useWallet } from "@solana/wallet-adapter-react";
import useCandyMachine from '../hooks/use-candy-machine';
import Header from '../components/header';
import Footer from '../components/footer';
import useWalletBalance from '../hooks/use-wallet-balance';
import { shortenAddress } from '../utils/candy-machine';
import Countdown from 'react-countdown';
import usePresale from '../hooks/use-presale';
import toast from 'react-hot-toast';
import { useWindowSize } from '../hooks/use-window-size';
import { useHorizontalScroll } from '../hooks/use-horizontal-scroll';
import { useLocalStorage } from '@solana/wallet-adapter-react';
import { Dialog, Transition } from '@headlessui/react';
import useAffiliation from '../hooks/use-affiliation';
import { AFFILIATION_CODE_LEN, MAX_NFT_HOLD_COUNT, MINT_STATUS } from '../utils/constant';

const Home = () => {
  const wallet = useWallet();
  const [balance] = useWalletBalance();
  const [isActive, setIsActive] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { isSoldOut, mintStartDate, isMinting, onMintNFT, nftsData } = useCandyMachine();
  const [isStatusLoading, mintStatus, currentHoldedCount] = usePresale();

  const {width, height} = useWindowSize();
  const [tag, setTag] = useLocalStorage('TAG', '');
  const { isAffiliationLoading, getCodeByWallet, getPubKeyByCode, insertCode } = useAffiliation();
  
  const [code, setCode] = useState('');
  const [visibleAffiliationModal, setVisibleAffiliationModal] = useState(false);
  const [visibleCheckModal, setVisibleCheckModal] = useState(false);
  const cancelButtonRef = useRef(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState(-1);

  const whyusRef = useRef(null);
  const roadmapRef = useHorizontalScroll();
  const benefitsRef = useRef(null);
  const attributesRef = useRef(null);
  const teamRef = useRef(null);
  const faqRef = useRef(null);

  // Handlers
  const handleMintAction = () => {
    if (!wallet.connected) {
      toast.error("Please connect wallet first.");
      return;
    }
    switch (mintStatus) {
      case MINT_STATUS.POSSIBLE:
        setVisibleCheckModal(true);
        break;
      case MINT_STATUS.NOT_WHITELISTED:
        toast.error("Mint failed! You are not in White List.");
        break;
      case MINT_STATUS.OVERFLOW_MAX_HOLD:
        toast.error("Mint failed! You can't hold over 3 Panda Warriors.");
        break;
      case MINT_STATUS.WAIT_OPENING:
        toast.error("Minting date will be announced soon, stay tuned!");
        break;
    }
  }

  const handleFaq = (index: number) => {
    if (index == activeFaqIndex) {
        setActiveFaqIndex(-1);
    } else {
        setActiveFaqIndex(index);
    }
  }

  const handleAffiliation = async () => {
    if (wallet.connected) {
      
      const existCode = await getCodeByWallet(wallet);

      if (existCode == '') {
        setVisibleAffiliationModal(true);
      } else {
        toast.success(`You have already generated code: ${existCode}`);
      }
    } else {
      toast.error("Please connect wallet first.");
    }
  }

  const handleAffiliationCode = async () => {
    if (code.length != AFFILIATION_CODE_LEN) {
      toast.error("Code should be 6 letters(digits and chars).");
      return;
    }

    const existPubkey = await getPubKeyByCode(code);

    if (existPubkey == '') {
      
      await insertCode(wallet, code);

      toast.success(`You successfully generated code: ${code}`);

      setVisibleAffiliationModal(false);
    } else {
      toast.error("This code is aready existed.");
    }
  }

  const handleCheckAffiliation = async () => {
    if (code.length != AFFILIATION_CODE_LEN) {
      toast.error("Code should be 6 letters(digits and chars).");
      return;
    }

    const existPubkey = await getPubKeyByCode(code);

    if (existPubkey == '') {
      toast.error("This code is not existed.");
    } else {

      if (existPubkey == wallet.publicKey?.toBase58()) {
        toast.error("You can't use your own code for mint.");
        return;
      }

      const possibleQuantity = MAX_NFT_HOLD_COUNT - currentHoldedCount;
      let realQuantity: number = quantity;
      if (quantity > possibleQuantity) {
        realQuantity = possibleQuantity;
      }
      await onMintNFT(realQuantity, existPubkey);
    }
  }

  const scrollToRef = (ref: any) => {
    window.scroll(
        {
          top: ref.current.offsetTop,
          behavior: "smooth",
        }
    );
  };

  useEffect(() => {
    (async () => {
      if (tag == '') return;

      switch (tag) {
        case 'WHYUS':
          scrollToRef(whyusRef);
          break;
        case 'ROADMAP':
          scrollToRef(roadmapRef);
          break;
        case 'BENEFITS':
          scrollToRef(benefitsRef);
          break;
        case 'ATTRIBUTES':
          scrollToRef(attributesRef);
          break;
        case 'TEAM':
          scrollToRef(teamRef);
          break;
        case 'FAQ':
          scrollToRef(faqRef);
          break;
      }

      setTag('');
    })();
  }, []);

  return (
    <main>
      <Toaster />

      <Head>
        <title>Panda Warriors</title>
        <meta name="description" content="You can purchase PANDA WARRIOR." />
        <link rel="icon" href="/icon.png" />
      </Head>

      <Header whyusRef={whyusRef} roadmapRef={roadmapRef} benefitsRef={benefitsRef} attributesRef={attributesRef} teamRef={teamRef} faqRef={faqRef} />

      {(width > 768) ?
      <section>
        <div className="w-full md:h-screen flex justify-center items-end background-overview-section">
          <div>
            <h3 className="text-white text-center overview-title drop-shadow-lg">PANDA WARRIORS</h3>
            <p className="text-white text-center overview-desc px-5 md:px-24">
              Panda Warriors is a collection of 10,000 generated NFTs, living on the Solana Blockchain, each asset is hand-drawn from scratch by a talented group of artists. Every art piece present on our website is hand-drawn by us. Each Panda Warrior is your lucky NFTicket, that will grow in value every phase of the Panda Warriors project development. Be a part of our journey full of adventures and fun.
            </p>
          </div>
        </div>
      </section>
      :
      <section>
        <div className="w-full flex justify-center items-center">
          <img src={'/images/background.png'} width="100%" />
        </div>
        <div className="">
          <h3 className="text-white text-center overview-title drop-shadow-lg">PANDA WARRIORS</h3>
          <p className="text-white text-center overview-desc px-5 md:px-24">
            Panda Warriors is a collection of 10,000 generated NFTs, living on the Solana Blockchain, each asset is hand-drawn from scratch by a talented group of artists. Every art piece present on our website is hand-drawn by us. Each Panda Warrior is your lucky NFTicket, that will grow in value every phase of the Panda Warriors project development. Be a part of our journey full of adventures and fun.
          </p>
        </div>
      </section>
      }
      
      <section>
        <div className="w-full md:h-screen flex justify-center items-end relative px-5 md:px-10">
          <div className="h-4/5 z-order-content">
            <div className="flex flex-col md:flex-row h-5/6">
              <div className="flex justify-center items-end">
                <img src={'/images/art1.png'} />
              </div>
              <div className="flex justify-center items-start">
                <img src={'/images/art2.png'} />
              </div>
              <div className="flex justify-center items-end">
                <img src={'/images/art3.png'} />
              </div>
              <div className="flex justify-center items-start">
                <img src={'/images/art4.png'} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 mt-16">
              <a href="https://discord.com/invite/EaefjHZJKH" target="_blank" className="m-2 col-span-1 md:col-start-2 z-order-top">
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded inline-flex items-center justify-center py-2 space-x-2 w-full">
                  <img src={'/images/icon_button_discord.png'} width={20} height={20} />
                  <span>Join Discord</span>
                </button>
              </a>
              <button className="border-gray-500 hover:border-white text-white border font-bold m-2 rounded py-2 col-span-1 md:col-start-3 z-order-top" onClick={handleAffiliation}>
                Mint Here Soon
              </button>
            </div>
          </div>          
        </div>
        
      </section>

      <section>
        <div className="w-full md:h-screen flex flex-col md:flex-row justify-center items-center p-10 space-x-5">
          <div className="z-order-content">
            <h5 className="text-white presale-title drop-shadow-lg">PANDA WARRIORS PRE-SALE</h5>
            <p className="text-white presale-desc">
              Be the first to get your hands on the Panda Warriors NFT. Limited 1500 registration passes with max 3 NFT per wallet.
              <br />
              <br />
              Special early adopters price 1 SOL.
            </p>
            <a href="https://forms.gle/WPXZiMiiGPUeeHX18" target="_blank">
              <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded inline-flex items-center justify-center w-52 py-2 space-x-2 mt-10">
                <span>Be the First</span>
                <img src={'/images/icon_missile.png'} width={20} height={20} />
              </button>
            </a>
          </div>
          <div className="flex justify-center items-center w-full md:w-2/5 mt-5">
            <img src={'/images/panda.png'} />
          </div>
        </div>
      </section>

      <section>
        <div className="w-full">
          <div className="panel-mint">
            <div className="panel-mint-background">
              <img src={'/images/panel_mint.png'} />
              <div className="panel-mint-button">
                <button className="panel-mint-button-ref" onClick={handleMintAction}><div></div></button>
              </div>
            </div>
          </div>
          <div className="panel-mint-timer invisible">
            <span>
              <span className="text-timer-big">33</span> <span className="text-timer-small">Days</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
              <span className="text-timer-big">2</span> <span className="text-timer-small">Hrs</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
              <span className="text-timer-big">10</span> <span className="text-timer-small">Min</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-timer-big">29</span> <span className="text-timer-small">Sec</span></span>
          </div>
        </div>
      </section>

      <section ref={whyusRef}>
        <div className="w-full px-10">
          <h3 className="text-section-title pb-10">WHY PANDA WARRIORS</h3>
          <div className="w-full flex md:justify-start items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">OUR MISSION</h5>
                <p className="panel-why-desc-text">Create a hand-drawn NFT Collection, where each NFT provides an EXPERIENCE for Community, carries UTILITY and grows in VALUE OVER TIME.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview1.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-end items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">UTILITY</h5>
                <p className="panel-why-desc-text">We believe NFTs, in general, have massive potential and impact on the entire world. NFTs are here to stay. Apart from being a nice piece of art, NFTs should have a utility purpose. Therefore, Panda Warriors NFT Collection has several utility features, which you will discover on our journey.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview2.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-start items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">EXPERIENCE</h5>
                <p className="panel-why-desc-text">Experience plays a significant role in the success of the NFT project, the art itself is already a great experience, however, we wanted to create something more than just an ART for our community, therefore, be ready for different experiences (adventures) on our way. All upcoming experiences will be announced in our Discord.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview3.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-end items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">LONGEVITY</h5>
                <p className="panel-why-desc-text">Our mission is to build a strong community of like-minded people, art-lovers, NFT-enthusiasts, passionate NFT collectors. We have long-term goals to be achieved together. We will be sharing our goals with PW Community step-by-step, as we move forward. The roadmap will only show you the beginning of our journey, so make sure to follow Panda Warriors on Twitter for the latest updates.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview4.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-start items-center z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">Our MOTO</h5>
                <p className="panel-why-desc-text">“EVERYONE WINS”. We are building a Community, where EVERYONE WINS, from early adopters to those, who will be joining Panda Warriors later on. Growing our community of Panda Warriors over time is our priority and our strength.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview5.png'} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={roadmapRef} className="section-roadmap">
        <div className="panel-roadmap">
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap1.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap2.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap3.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap4.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap5.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
        </div>
      </section>

      <section ref={benefitsRef}>
        <div className="w-full px-10 py-10">
          <h3 className="text-section-title pb-5">BENEFITS</h3>
          <p className="text-section-desc pb-16">WHY HOLDING PANDA WARRIORS?</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                <img src={'/images/benefits1.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">100% ROYALTY FOR THE COMMUNITY.</h5>
              <p className="panel-why-desc-text">10% royalty from the secondary sales. 100% of Royalties collected in the Community Royalty Pool. These 100% Royalty rewards will be distributed back to the PW Holders in different forms  (blue-chip NFTs, Prizes other rewards).</p>
              <div className="panel-benefit-background-tree w-1/4 h-full"></div>
            </div>

            <div className="md:col-span-1 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                  <img src={'/images/benefits2.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">PW RAFFLE GAMES</h5>
              <p className="panel-why-desc-text">PW is your lucky NFTicket to join the Raffle Draw and win Exciting Prizes (up to 60 SOL in value). 12 Raffle Games will be played during 12 months from minting. 1 PW = 12 Entries.</p>
            </div>

            <div className="md:col-span-1 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                  <img src={'/images/benefits3.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">PANDA FRIENDS REWARDS</h5>
              <p className="panel-why-desc-text">100 Lucky Panda Warriors holders will be airdropped upcoming Panda Friends NFTs. Panda Friends coming with a purpose...</p>
            </div>

            <div className="md:col-span-2 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                <img src={'/images/benefits4.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">TREASURE BOX</h5>
              <p className="panel-why-desc-text">The Treasure Box will be filled with 2000 sol (once all 10,000 Panda Warriors has been successfully minted). 2000 sol will be reinvested in crypto projects (community vote) to grow our Community Treasury. In 3 months time, Panda Warriors’ Holders will start getting rewards from a Treasure Box.</p>
              <div className="panel-benefit-background-tree w-1/4 h-full"></div>
            </div>

            <div className="md:col-span-2 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                <img src={'/images/benefits5.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">PW LAUNCHPAD</h5>
              <p className="panel-why-desc-text">Grant access to new high-potential NFT projects first, receive airdrops and get whitelisted, by holding Panda Warriors.</p>
              <div className="panel-benefit-background-tree w-1/4 h-full"></div>
            </div>

            <div className="md:col-span-1 flex justify-center items-center">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-center items-center">
                  <img src={'/images/benefits6.png'} width='70%' />
                </div>
                <h5 className="panel-why-desc-title text-center">Coming Soon...</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={attributesRef}>
        <div className="w-full relative background-traits-section">
          <div className="pandagif-block">
            <img src={'/images/pwSlideshow.gif'} />
          </div>
          <div className="panel-trait flex justify-center">
            <div className="flex flex-col space-y-2">
              <h3 className="text-white text-center text-section-title drop-shadow-lg">TRAITS</h3>
              <p className="text-white text-center overview-desc px-5 md:px-32">
                Panda Warriors NFT Collection is generated out of 240 different hand-drawn traits. Some traits are rarer than others, classifying all 10,000 Panda Warriors rarity from common, uncommon, rare to super rare. There are only 12 unique 1 of 1 Panda Warriors NFTs that having 100% exclusive combination of traits, making them one-of-a-kind pieces. The traits include background, body skin, bodywear, eyes, ears, hat, mouth shape, mouth accessories, tools. Soon after minting, you will be able to check the rarity score of your Panda Warriors and find out how rare your Panda Warrior is.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={teamRef}>
        <div className="w-full px-10">
          <h3 className="text-section-title pb-10">TEAM</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-1 flex flex-col space-y-2">
              <div className="w-full flex justify-center items-center">
                <img src={'/images/team1.png'} />
              </div>
              <p className="text-team-name">Artists Team</p>
              <div className="w-full flex justify-center items-center invisible">
                <a href="#" className="inline-flex text-center space-x-2"><span className="text-team-link">View Team</span><img src={'/images/icon_arrow_right.png'} width="24" height="24" /></a>
              </div>
            </div>

            <div className="col-span-1 flex flex-col space-y-2">
              <div className="w-full flex justify-center items-center">
                <img src={'/images/team2.png'} />
              </div>
              <p className="text-team-name">Project Management Team</p>
              <div className="w-full flex justify-center items-center invisible">
                <a href="#" className="inline-flex text-center space-x-2"><span className="text-team-link">View Team</span><img src={'/images/icon_arrow_right.png'} width="24" height="24" /></a>
              </div>
            </div>

            <div className="col-span-1 flex flex-col space-y-2">
              <div className="w-full flex justify-center items-center">
                <img src={'/images/team3.png'} />
              </div>
              <p className="text-team-name">Blockchain Devs Team</p>
              <div className="w-full flex justify-center items-center invisible">
                <a href="#" className="inline-flex text-center space-x-2"><span className="text-team-link">View Team</span><img src={'/images/icon_arrow_right.png'} width="24" height="24" /></a>
              </div>
            </div>

            <div className="col-span-1 flex flex-col space-y-2">
              <div className="w-full flex justify-center items-center">
                <img src={'/images/team4.png'} />
              </div>
              <p className="text-team-name">Marketing Team</p>
              <div className="w-full flex justify-center items-center invisible">
                <a href="#" className="inline-flex text-center space-x-2"><span className="text-team-link">View Team</span><img src={'/images/icon_arrow_right.png'} width="24" height="24" /></a>
              </div>
            </div>
          </div>

          <p className="text-team-desc py-10 px-5 md:px-32">
            Our international team is a synergy of professional artists, experienced blockchain developers, web developers, project management team, marketing team, discord and social media team -  all working hard to make sure our Panda Warriors Community is getting the best experience and benefits, making our project one-of-a-kind. Our team is constantly expanding along with the project and the community. 
          </p>
        </div>
      </section>

      <section ref={faqRef}>
        <div className="w-full px-5 md:px-16 pb-10 relative">
          <h3 className="text-section-title pb-10">FAQ'S</h3>

          <div className="panel-faq">
            <div className={activeFaqIndex == 0 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(0)}>
                    <div>When Panda Warriors can be mine?</div>
                    <div className='faq-icon'>{activeFaqIndex == 0 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 0 ? 'active-faq-content' : 'faq-content'}>The Launch Day will be announced on Twitter, Discord and on the official Panda Warriors Website. Stay Tuned not to miss!</div>
            </div>
            <div className={activeFaqIndex == 1 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(1)}>
                    <div>How to Get Panda Warriors NFT for FREE?</div>
                    <div className='faq-icon'>{activeFaqIndex == 1 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 1 ? 'active-faq-content' : 'faq-content'}>If you are a true Panda Warrior and wish to adopt your Panda Warrior before a Minting Day, you can get your Panda Warrior for FREE by participating in our GIVEAWAYS on Twitter and Discord. All you need to do is stay active, comment. share, retweet, and let’s grow our Panda Warriors Community together</div>
            </div>
            <div className={activeFaqIndex == 2 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(2)}>
                    <div>What are the Benefits of Inviting my Friends?</div>
                    <div className='faq-icon'>{activeFaqIndex == 2 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 2 ? 'active-faq-content' : 'faq-content'}>Build your Panda Warrior Team! Spread the word about Panda Warriors, invite your friends to join our family and  GET 10% REWARDS FROM  EACH MINT of all invited by you Panda Warriors. Get your invite link in our Discord.</div>
            </div>
            <div className={activeFaqIndex == 3 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(3)}>
                    <div>What is a Public Mint Price?</div>
                    <div className='faq-icon'>{activeFaqIndex == 3 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 3 ? 'active-faq-content' : 'faq-content'}>Mint Price is 1.5 SOL.</div>
            </div>
            <div className={activeFaqIndex == 4 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(4)}>
                    <div>Is there a PRE-SALE?</div>
                    <div className='faq-icon'>{activeFaqIndex == 4 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 4 ? 'active-faq-content' : 'faq-content'}>Special early adopters price 1 SOL. If you would like to mint more PWs, you can still participate in a Public Mint.</div>
            </div>
            <div className={activeFaqIndex == 5 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(5)}>
                    <div>Where will Panda Warriors Live?</div>
                    <div className='faq-icon'>{activeFaqIndex == 5 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 5 ? 'active-faq-content' : 'faq-content'}>Our Panda Warriors will live on Solana Blockchain - a beautiful place with low gas fees, fast transactions and huge growth potential. All Panda Warriors NFTs images are safely stored on the Arweave forever. </div>
            </div>
            <div className={activeFaqIndex == 6 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(6)}>
                    <div>Why should I HODL my Panda Warriors after minting?</div>
                    <div className='faq-icon'>{activeFaqIndex == 6 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 6 ? 'active-faq-content' : 'faq-content'}>
                  Hodling your Panda Warriors will grant access to the following rewards (read details in BENEFITS):
                  <br />
                  <br />
                  <ul className="faq-list">
                    <li>100% Royalty Pool</li>
                    <li>Treasure Box</li>
                    <li>Monthly Raffle Games</li>
                    <li>Panda Friends Rewards</li>
                    <li>PW Launchpad</li>
                    <li>And other ongoing rewards...</li>
                  </ul>
                </div>
            </div>
            <div className={activeFaqIndex == 7 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(7)}>
                    <div>How many Panda Warriors can I mint?</div>
                    <div className='faq-icon'>{activeFaqIndex == 7 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 7 ? 'active-faq-content' : 'faq-content'}>Each wallet can mint up to 5 PW per wallet and max 5 PW per transaction. </div>
            </div>
            <div className={activeFaqIndex == 8 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(8)}>
                    <div>Will Panda Warriors be listed on the secondary market?</div>
                    <div className='faq-icon'>{activeFaqIndex == 8 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 8 ? 'active-faq-content' : 'faq-content'}>Yes! Once minting of all Panda Warriors is completed, a secondary marketplace will open its doors for you to trade your PWs. Soon after 100% minting,  our own PW Marketplace will be open! Stay Tuned.</div>
            </div>
            <div className={activeFaqIndex == 9 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(9)}>
                    <div>How to regulate the floor price on the Secondary market?</div>
                    <div className='faq-icon'>{activeFaqIndex == 9 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 9 ? 'active-faq-content' : 'faq-content'}>To ensure the floor price is stable and not dropping below the mint price, Panda Warriors NFTs that were listed below the minting price on the secondary market will be bought - back. Don’t rush to sell your Panda Warrior below its value, not to miss bigger rewards in a long run. Other measures to stimulate a healthy floor price will be implemented as well. Panda Warrior’s holders that have active listings below mint price (below 1.5 sol) on a secondary market, will not be eligible for the benefits listed above (monthly raffle games, airdrops, royalty pool bonus)</div>
            </div>
            <div className={activeFaqIndex == 10 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(10)}>
                    <div>Who is behind the project?</div>
                    <div className='faq-icon'>{activeFaqIndex == 10 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 10 ? 'active-faq-content' : 'faq-content'}>Our international team is a synergy of talented artists, experienced developers, business development professionals, marketers and moderators -  all working hard to make sure our Panda Warriors Community is getting the best experience and benefits, making our project one-of-a-kind. Our team will be growing along with the project and the community. </div>
            </div>
          </div>

          <div className="panel-faq-background-tree w-1/3 h-3/4"></div>
        </div>
      </section>

      <Footer />

      <Transition.Root show={visibleAffiliationModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setVisibleAffiliationModal}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Generate Affiliation Code
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Please type your own code and share it with your friend or family.
                          You can get extra SOL when they mint.
                        </p>
                        <input maxLength={6} minLength={6} onChange={(e) => {setCode(e.target.value)}} className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-black mt-5 leading-tight focus:outline-none focus:shadow-outline text-center" type="text" placeholder="6 Letters(digits and chars)"></input>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-500 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleAffiliationCode}
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setVisibleAffiliationModal(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={visibleCheckModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setVisibleCheckModal}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Check Affiliation Code
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Please type code which was received from affiliator.
                          If you have no, please type 000001.
                        </p>
                        <input maxLength={6} minLength={6} onChange={(e) => {setCode(e.target.value)}} className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-black mt-5 leading-tight focus:outline-none focus:shadow-outline text-center" type="text" placeholder="6 Letters(digits and chars)"></input>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-500 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleCheckAffiliation}
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setVisibleCheckModal(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {(wallet.connected && (isAffiliationLoading || isStatusLoading || isMinting)) &&
        <div className="w-full h-full fixed block top-0 left-0 bg-black opacity-75 z-50 flex justify-center items-center">
          <div
            className="
              animate-spin
              rounded-full
              h-32
              w-32
              border-t-2 border-b-2 border-yellow-600
            "
          ></div>
        </div>
      }

      {/* <div className="flex flex-col justify-center items-center flex-1 space-y-3 mt-20">

        {!wallet.connected && <span
          className="text-gray-800 font-bold text-2xl cursor-default">
          NOT CONNECTED, PLEASE CLICK SELECT WALLET...
        </span>}

        {wallet.connected &&
          <p className="text-gray-800 font-bold text-lg cursor-default">Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}</p>
        }

        {wallet.connected &&
          <>
            <p className="text-gray-800 font-bold text-lg cursor-default">Balance: {(balance || 0).toLocaleString()} SOL</p>
            <p className="text-gray-800 font-bold text-lg cursor-default">Available / Minted / Total: {nftsData.itemsRemaining} / {nftsData.itemsRedeemed} / {nftsData.itemsAvailable}</p>
          </>
        }

        <div className="flex flex-col justify-center items-center">

          {wallet.connected && 
            (
              isLoading ?
              <div className="loader"></div>
              :
              <>
                <input 
                  min={1}
                  max={3}
                  type="number" 
                  onChange={(e) => {setQuantity(Number(e.target.value));}} 
                  style={{border: 'solid 1px grey', textAlign: 'center', width: '50%', margin: 5}} 
                  value={quantity} />
                <button
                  disabled={isSoldOut || isMinting || !isActive}
                  onClick={handleMintAction}
                  className="w-full mt-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded"
                >
                  {isSoldOut ? (
                    "SOLD OUT"
                  ) : isActive ?
                    <span>MINT {quantity} {isMinting && 'LOADING...'}</span> :
                    <Countdown
                      date={mintStartDate}
                      onMount={({ completed }) => completed && setIsActive(true)}
                      onComplete={() => setIsActive(true)}
                      renderer={renderCounter}
                    />
                  }
                </button>
              </>
            )
          }
        </div>
      </div> */}
    </main>
  );
};

const renderCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <span className="text-gray-800 font-bold text-2xl cursor-default">
      Live in {days} days, {hours} hours, {minutes} minutes, {seconds} seconds
    </span>
  );
};

export default Home;



