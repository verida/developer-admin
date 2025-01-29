"use client"

import { type DatastoreOpenConfig } from "@verida/types"
import { WebUser } from "@verida/web-helpers"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { commonConfig } from "@/config/common"
import { VERIDA_APPLICATION_CONTEXT_NAME } from "@/constants/app"
import {
  VeridaContext,
  type VeridaContextType,
} from "@/features/verida/contexts/verida-context"

/* eslint-disable no-console */

const webUserInstance = new WebUser({
  debug: commonConfig.DEV_MODE,
  clientConfig: {
    network: commonConfig.VERIDA_NETWORK,
    didClientConfig: {
      network: commonConfig.VERIDA_NETWORK,
      rpcUrl: commonConfig.VERIDA_RPC_URL,
    },
  },
  contextConfig: {
    name: VERIDA_APPLICATION_CONTEXT_NAME,
  },
  accountConfig: {
    request: {
      logoUrl: `${commonConfig.BASE_URL}/images/verida_vault_logo_for_connect.png`,
    },
    network: commonConfig.VERIDA_NETWORK,
  },
})

export interface VeridaProviderProps {
  children?: React.ReactNode
}

export function VeridaProvider(props: VeridaProviderProps) {
  const webUserInstanceRef = useRef(webUserInstance)

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [did, setDid] = useState<string | null>(null)

  const updateStates = useCallback(async () => {
    const newIsConnected = webUserInstance.isConnected()
    setIsConnected(newIsConnected)
    setIsConnecting(false)
    setIsDisconnecting(false)

    if (!newIsConnected) {
      // If not connected, no need to continue, just clear everything
      setDid(null)
      return
    }

    try {
      const newDid = webUserInstance.getDid()
      setDid(newDid)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Only error is if user not connected which is prevented by above check
      setDid(null)
    }
  }, [])

  const autoConnect = useCallback(async () => {
    console.info("Checking for existing Verida session")

    if (!webUserInstance.hasSession()) {
      console.info("No existing Verida session found, skipping connection")
      return
    }

    console.info("Existing Verida session found, connecting automatically...")

    setIsConnecting(true)
    try {
      const connected = await webUserInstanceRef.current.connect()
      // Will trigger a 'connected' event if already connected and therefore update the states
      console.info(
        connected
          ? "Connection to Verida successful"
          : "Connection to Verida failed"
      )
    } catch (error) {
      console.warn("Connection to Verida with existing session failed")
      console.error(error)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const connectionEventListener = useCallback(() => {
    void updateStates()
  }, [updateStates])

  useEffect(() => {
    console.info("Initialising the Verida client")
    webUserInstance.addListener("connected", connectionEventListener)
    webUserInstance.addListener("disconnected", connectionEventListener)

    void autoConnect()

    return () => {
      console.info("Cleaning the Verida client")
      webUserInstance.removeAllListeners()
    }
  }, [connectionEventListener, autoConnect])

  const connect = useCallback(async () => {
    console.info("User connecting to Verida")

    setIsConnecting(true)
    const connected = await webUserInstanceRef.current.connect()
    setIsConnecting(false)

    console.info(
      connected
        ? "Connection to Verida successful"
        : "User did not connect to Verida"
    )
  }, [webUserInstanceRef])

  const disconnect = useCallback(async () => {
    console.info("User disconnecting from Verida")

    setIsDisconnecting(true)
    await webUserInstanceRef.current.disconnect()
    setIsDisconnecting(false)

    console.info("User successfully disconnected from Verida")
  }, [webUserInstanceRef])

  const getAccountSessionToken = useCallback(async () => {
    const account = webUserInstanceRef.current.getAccount()
    const contextSession = await account.getContextSession(
      VERIDA_APPLICATION_CONTEXT_NAME
    )

    if (!contextSession) {
      throw new Error("No context session found")
    }

    const stringifiedSession = JSON.stringify(contextSession)
    const sessionToken = Buffer.from(stringifiedSession).toString("base64")
    return sessionToken
  }, [webUserInstanceRef])

  const openDatastore = useCallback(
    async (schemaUrl: string, config?: DatastoreOpenConfig) => {
      console.info("Opening Verida datastore", {
        schemaUrl,
        config,
      })

      const datastore = await webUserInstanceRef.current.openDatastore(
        schemaUrl,
        config
      )

      console.info("Verida datastore succesfully opened", {
        schemaUrl,
        config,
      })
      return datastore
    },
    [webUserInstanceRef]
  )

  const contextValue: VeridaContextType = useMemo(
    () => ({
      isReady: isConnected && !!did,
      isConnected,
      isConnecting,
      isDisconnecting,
      did,
      connect,
      disconnect,
      getAccountSessionToken,
      openDatastore,
      webUserInstanceRef,
    }),
    [
      isConnected,
      isConnecting,
      isDisconnecting,
      did,
      connect,
      disconnect,
      getAccountSessionToken,
      openDatastore,
      webUserInstanceRef,
    ]
  )

  return (
    <VeridaContext.Provider value={contextValue}>
      {props.children}
    </VeridaContext.Provider>
  )
}
VeridaProvider.displayName = "VeridaProvider"
