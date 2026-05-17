import { X, Printer, Download } from 'lucide-react'

export default function PrintTicketModal({ open, onClose, ticket }) {
  if (!open || !ticket) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-blue-900 px-6 py-4 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-xl font-bold">Traffic Ticket</h2>
            <p className="text-blue-200 text-sm">Namibian Police</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-4 print:space-y-3">
          <div className="border-b pb-3">
            <p className="text-xs text-gray-500 uppercase">Ticket Number</p>
            <p className="text-lg font-mono font-bold text-gray-800">{ticket.ticket_issued || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Plate Number</p>
              <p className="font-semibold text-gray-800">{ticket.plate_no}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">License Number</p>
              <p className="font-semibold text-gray-800">{ticket.license_no}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">Driver/Owner</p>
            <p className="font-semibold text-gray-800">{ticket.owner_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Violation</p>
              <p className="font-semibold text-gray-800">{ticket.violation_type_display}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Amount</p>
              <p className="font-bold text-red-600">N${ticket.amount}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">Location</p>
            <p className="font-semibold text-gray-800">{ticket.location || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Date</p>
              <p className="font-semibold text-gray-800">{ticket.date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Status</p>
              <p className="font-semibold text-yellow-600">{ticket.status}</p>
            </div>
          </div>

          <div className="pt-3 border-t text-xs text-gray-500 text-center">
            Pay within 30 days to avoid penalty
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  )
}

