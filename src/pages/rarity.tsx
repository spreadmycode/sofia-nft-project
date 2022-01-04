import Head from 'next/head'
import { Toaster } from 'react-hot-toast';
import Header from '../components/header';
import { gql, useQuery } from "@apollo/client";
import NftCard from '../components/nft-card';
import { Dialog, Transition } from '@headlessui/react';
import { useState, Fragment, useRef } from 'react';

export const GET_ITEMS = gql`
  query getItems($first: Int, $after: String) {
    getItems(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          image
          traits
          score
          pos
          hash
        }
      }
    }
  }
`;

const first = 20;
const delay = true;

const Rarity = () => {

  const [visibleDetailModal, setVisibleDetailModal] = useState(false);
  const cancelButtonRef = useRef(null);
  const [nftDetail, setNftDetail] = useState<any>();

  const { error, loading, data, fetchMore, networkStatus } = useQuery(GET_ITEMS, {
    variables: { first, delay },
    notifyOnNetworkStatusChange: true,
  });

  const hasNextPage = data?.getItems.pageInfo.hasNextPage;
  const isRefetching = networkStatus === 3;

  const handleShowDetail = (detail: any) => {
    let nftData = {
      ...detail,
      traits: JSON.parse(detail.traits)
    };
    setNftDetail(nftData);
    setVisibleDetailModal(true);
  }

  return (
    <div>
      <Toaster />
      <Head>
        <title>Panda Warriors</title>
        <meta name="description" content="Panda Warriors is a collection of 10,000 generated NFTs, living on the Solana Blockchain, each asset is hand-drawn from scratch by a talented group of artists. Every art piece present on our website is hand-drawn by us. Each Panda Warrior is your lucky NFTicket, that will grow in value every phase of the Panda Warriors project development. Be a part of our journey full of adventures and fun." />
        <link rel="icon" href="/icon.png" />
      </Head>

      <Header />

      <section>
      {
        error ?
            <p className="text-center text-white">Error! ${error}</p>
          :
          <div className="flex flex-col md:flex-row space-y-2 md:space-x-2">

            <div className="w-full md:w-1/4 flex flex-col theme-bg-color px-5">
              <p className="text-gray-400 text-center font-bold p-3">ITEM FILTERS</p>
              <div className="h-px bg-gray-600"></div>

              <p className="text-gray-600 p-3">IDs (syntax: 1,2,5-10)</p>
              <input
                type="text"
                className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400"
                placeholder="IDs"
              />
            
              <p className="text-gray-600 p-3">Attribute Count</p>
              <select className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option className="bg-gray-800 text-gray-400">Please select</option>
                <option className="bg-gray-800 text-gray-400">Item1</option>
                <option className="bg-gray-800 text-gray-400">Item2</option>
                <option className="bg-gray-800 text-gray-400">Item3</option>
              </select>

              <p className="text-gray-600 p-3">Background</p>
              <select className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option className="bg-gray-800 text-gray-400">Please select</option>
                <option className="bg-gray-800 text-gray-400">Item1</option>
                <option className="bg-gray-800 text-gray-400">Item2</option>
                <option className="bg-gray-800 text-gray-400">Item3</option>
              </select>

              <p className="text-gray-600 p-3">Clothing</p>
              <select className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option className="bg-gray-800 text-gray-400">Please select</option>
                <option className="bg-gray-800 text-gray-400">Item1</option>
                <option className="bg-gray-800 text-gray-400">Item2</option>
                <option className="bg-gray-800 text-gray-400">Item3</option>
              </select>


              <p className="text-gray-600 p-3">Rank</p>
              <div className="w-full flex flex-row space-x-2">
                <input
                  type="text"
                  className="w-1/2 h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400"
                  placeholder="From"
                />
                <input
                  type="text"
                  className="w-1/2 h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400"
                  placeholder="To"
                />
              </div>
            </div>

            <div className="w-full md:w-3/4 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 m-2">
                {
                  data?.getItems.edges.map((edge: any) => {
                    return (
                      <NftCard 
                        key={edge.node.hash}
                        name={edge.node.name}
                        score={edge.node.score}
                        pos={edge.node.pos}
                        image={edge.node.image}
                        detail={edge.node}
                        handleShowDetail={handleShowDetail}
                      />
                    );
                  })
                }
              </div>
              {
                hasNextPage && (
                  <button
                    className={`bg-transparent hover:${loading ? "bg-transparent" : "bg-blue-900 border border-blue-900"} text-blue-900 hover:text-gray-400 py-2 px-4 hover:border-transparent rounded flex inline-block justify-center items-center m-2`}
                    disabled={isRefetching}
                    onClick={() =>
                      fetchMore({
                        variables: {
                          first,
                          after: data.getItems.pageInfo.endCursor,
                        },
                      })
                    }
                  >
                    { 
                      loading ?
                        <div
                          className="
                            animate-spin
                            rounded-full
                            h-8
                            w-8
                            border-t-2 border-b-2 border-blue-900
                          "
                        ></div>
                      :
                        "Load more"
                    }
                  </button>
                )
              }
            </div>

          </div>
      }
      </section>

      <Transition.Root show={visibleDetailModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setVisibleDetailModal}>
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
                      <Dialog.Title as="h3" className="text-lg leading-6 font-bold text-gray-900">
                        {nftDetail?.name}
                      </Dialog.Title>

                      <div className="mt-5 w-full flex flex-col space-y-2">

                        <div className="w-full flex flex-col md:flex-row">
                          <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                            <a href={nftDetail?.image} target="_blank">
                              <img src={nftDetail?.image} />
                            </a>
                          </div>
                          <div className="w-full md:w-2/3 flex flex-col space-y-2">
                            <p className="font-bold text-center text-gray-900">PROPERTIES</p>
                            <div className="w-full flex flex-row justify-center items-center">
                              <div className="w-1/3 flex flex-col justify-center items-center">
                                <p className='text-center text-gray-400'>RANK</p>
                                <p className='text-center font-bold text-gray-700'>{nftDetail?.pos}</p>
                              </div>
                              <div className="w-px bg-gray-400"></div>
                              <div className="w-1/3 flex flex-col justify-center items-center">
                                <p className='text-center text-gray-400'>SCORE</p>
                                <p className='text-center font-bold text-gray-700'>{nftDetail?.score}</p>
                              </div>
                              <div className="w-px bg-gray-400"></div>
                              <div className="w-1/3 flex flex-col justify-center items-center">
                                <p className='text-center text-gray-400'>TRAITS</p>
                                <p className='text-center font-bold text-gray-700'>{nftDetail?.traits.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="font-bold text-center text-gray-900">ATTRIBUTES</p>
                        <div className="w-full grid grid-cols-4 gap-1">
                          {
                            nftDetail?.traits.map((trait: any, index: number) => {
                              return (
                                <div key={index} className="col-span-1 bg-blue-400 hover:bg-blue-500 rounded-lg overflow-hidden flex flex-col justify-center items-center space-y-2 p-2 cursor-pointer">
                                  <p className="text-center text-gray-600 text-xs">{trait.trait_type}</p>
                                  <p className="text-center text-blue-200 font-bold text-sm">{trait.value}</p>
                                </div>
                              )
                            })
                          }
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setVisibleDetailModal(false)}
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
    </div>
  );
};

export default Rarity;



