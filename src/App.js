import { useEffect, useState } from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import {
  Box,
  Heading,
  Container,
  Flex,
  Spacer,
  Tag,
  Text,
  Button,
  Stack,
} from '@chakra-ui/react'

import Calendar from './components/Calendar'
import MintTokensDrawer from './components/MintTokensDrawer'

import { ethers } from 'ethers'
import abi from './abis/Web3bnb.json'
import SetRateDrawer from './components/SetRateDrawer'

// const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3' // localhost
const contractAddress = '0xf4EeD0468808D57f642fB635f7c85D03Ae2B4340' // rinkeby
const contractABI = abi.abi
const provider = new ethers.providers.Web3Provider(window.ethereum)
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  provider.getSigner()
)

const logAccounts = (accounts) => {
  console.log(`Accounts:\n${accounts.join('\n')}`)
}
window.ethereum.on('accountsChanged', logAccounts)

const logChain = (chain) => {
  console.log(`Chain:\n${chain}`)
}
window.ethereum.on('chainChanged', logChain)

// Shorten wallet address.
const shortAddress = (str) =>
  `${str.substring(0, 5)}...${str.substring(str.length - 4)}`

function App() {
  const [chain, setChain] = useState(false)
  const [account, setAccount] = useState(false)
  // admin rate setting functionality
  const [isAdmin, setIsAdmin] = useState(false)

  const isConnected = async () => {
    const provider = await detectEthereumProvider()
    const accounts = await provider.request({ method: 'eth_accounts' })
    const chainId = await provider.request({ method: 'eth_chainId' })

    if (accounts.length > 0) {
      console.log('setAccount', accounts[0])
      setAccount(accounts[0])
      console.log('setChainId', chainId)
      setChain(chainId)
    } else {
      console.log('No authorized account found')
    }
  }

  const connect = async () => {
    try {
      const provider = await detectEthereumProvider()

      // returns an arrary of accounts
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      })

      // check if array at least one element
      if (accounts.length > 0) {
        setAccount(accounts[0])
      } else {
        alert('No account found')
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    isConnected()
  }, [])

  useEffect(() => {
    const getData = async () => {
      // get contract owner and set admin if connected account is owner
      const owner = await contract.owner()
      setIsAdmin(owner.toUpperCase() === account.toUpperCase())
      console.log('owner', owner)
    }
    getData()
  }, [account])

  return (
    <>
      <Flex
        p={{ base: 4, md: 8 }}
        minWidth="max-content"
        alignItems="center"
        gap="2"
      >
        {account && isAdmin && <MintTokensDrawer contract={contract} />}
        {account && isAdmin && <SetRateDrawer contract={contract} />}
        <Spacer />
        {!account && (
          <Button
            onClick={connect}
            colorScheme={'green'}
            bg={'green.400'}
            rounded={'full'}
            px={6}
            _hover={{
              bg: 'green.500',
            }}
          >
            Connect Wallet
          </Button>
        )}
        {account && (
          <Tag size="lg" colorScheme="green" borderRadius="full">
            {shortAddress(account)}
          </Tag>
        )}
      </Flex>
      <Container maxW={'3xl'}>
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 12, md: 20 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight={'110%'}
          >
            🏡 web3bnb <br />
            <Text as={'span'} color={'green.400'}>
              Own. Book. Enjoy!
            </Text>{' '}
            <br />
          </Heading>
          <Text color={'gray.500'}>
            Monetize your content by charging your most loyal readers and reward
            them loyalty points. Give back to your loyal readers by granting
            them access to your pre-releases and sneak-peaks.
          </Text>
          <Stack
            direction={'column'}
            spacing={3}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}
          >
            {!account && <Text>Please connect to Rinkeby Network.</Text>}
            {account && <Calendar account={account} />}
          </Stack>
        </Stack>
      </Container>
    </>
  )
}

export default App
