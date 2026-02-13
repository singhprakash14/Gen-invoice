'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FileText, Download, Plus, Search, Edit3, Trash2, Eye } from 'lucide-react';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const deleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/invoices/${id}`);
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice', error);
      }
    }
  };

  const downloadPdf = async (id: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading PDF', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FileText size={28} /> InvoicePro
        </h1>
        <Link 
          href="/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium transition"
        >
          <Plus size={20} /> New Invoice
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Invoices Dashboard</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-20 text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-blue-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No invoices found</h3>
              <p className="text-gray-500 mb-6">Create your first invoice to get started.</p>
              <Link href="/create" className="text-blue-600 font-bold hover:underline">
                Start Creating →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Account</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Paid</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Remaining</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((invoice: any) => (
                    <tr key={invoice._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link href={`/view/${invoice._id}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline">
                          {invoice.clientName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{invoice.accountNumber}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">₹{invoice.totalAmount}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">₹{invoice.paidAmount}</td>
                      <td className="px-6 py-4 text-red-500 font-medium">₹{invoice.remainingAmount}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Link 
                          href={`/view/${invoice._id}`}
                          className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition"
                          title="View Invoice Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          href={`/edit/${invoice._id}`}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
                          title="Edit Invoice"
                        >
                          <Edit3 size={18} />
                        </Link>
                        <button 
                          onClick={() => downloadPdf(invoice._id)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => deleteInvoice(invoice._id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition"
                          title="Delete Invoice"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-gray-400 text-sm border-t bg-white">
        © 2026 InvoicePro - Powered by webmasterify.in
      </footer>
    </div>
  );
}
