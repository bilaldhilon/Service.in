"use client"

interface Contact {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unread: number
}

interface ChatSidebarProps {
  contacts: Contact[]
  selectedContactId: string | undefined
  onSelectContact: (contact: Contact) => void
}

export default function ChatSidebar({ contacts, selectedContactId, onSelectContact }: ChatSidebarProps) {
  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If this week, show day name
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <input type="text" placeholder="Search conversations..." className="input input-bordered w-full" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <p>No conversations yet</p>
          </div>
        ) : (
          <ul>
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className={`border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                  selectedContactId === contact.id ? "bg-gray-100" : ""
                }`}
                onClick={() => onSelectContact(contact)}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">{contact.name}</div>
                    <div className="text-xs text-gray-500">{formatTimestamp(contact.timestamp)}</div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-600 truncate max-w-[180px]">{contact.lastMessage}</div>
                    {contact.unread > 0 && (
                      <div className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {contact.unread}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
