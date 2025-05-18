"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface Contact {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unread: number
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

interface ChatWindowProps {
  contact: Contact
  messages: Message[]
  currentUserId: string
  onSendMessage: (content: string) => void
}

export default function ChatWindow({ contact, messages, currentUserId, onSendMessage }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  function formatMessageTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  function formatMessageDate(timestamp: string) {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
  }

  // Group messages by date
  const messagesByDate: { [date: string]: Message[] } = {}
  messages.forEach((message) => {
    const date = new Date(message.timestamp).toLocaleDateString()
    if (!messagesByDate[date]) {
      messagesByDate[date] = []
    }
    messagesByDate[date].push(message)
  })

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="font-semibold">{contact.name}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(messagesByDate).map((date) => (
          <div key={date}>
            <div className="text-center my-4">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                {formatMessageDate(messagesByDate[date][0].timestamp)}
              </span>
            </div>

            {messagesByDate[date].map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.senderId === currentUserId
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <div>{message.content}</div>
                  <div className="text-xs mt-1 flex justify-end items-center">
                    <span className={message.senderId === currentUserId ? "text-primary-content/70" : "text-gray-500"}>
                      {formatMessageTime(message.timestamp)}
                    </span>

                    {message.senderId === currentUserId && (
                      <span className="ml-1">
                        {message.read ? (
                          <i className="bi bi-check-all text-blue-400"></i>
                        ) : (
                          <i className="bi bi-check"></i>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            placeholder="Type a message..."
            className="input input-bordered flex-1 mr-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
            <i className="bi bi-send"></i>
          </button>
        </form>
      </div>
    </div>
  )
}
