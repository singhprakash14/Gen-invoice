'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Download, Edit3, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ViewInvoice({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/invoices/${id}`);
        setInvoice(response.data);
      } catch (error) {
        console.error('Error fetching invoice', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const downloadPdf = async () => {
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

  const deleteInvoice = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/invoices/${id}`);
        router.push('/');
      } catch (error) {
        console.error('Error deleting invoice', error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/edit/${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit3 size={18} />
              Edit
            </Link>
            <button
              onClick={downloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download size={18} />
              Download PDF
            </button>
            <button
              onClick={deleteInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="border-b pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                  WM
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Webmasterify and It Solution</h1>
                  <p className="text-sm text-gray-600">Phone: 9307324014</p>
                  <p className="text-sm text-gray-600">Email: webmasterifyy@gmail.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800">Tax Invoice</h2>
                <p className="text-sm text-gray-600 mt-2">Invoice No.: {id.slice(-6).toUpperCase()}</p>
                <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Bill To:</h3>
            <p className="text-lg font-semibold text-gray-800">{invoice.clientName}</p>
            <p className="text-sm text-gray-600">Account: {invoice.accountNumber}</p>
          </div>

          {/* Items Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">HSN/SAC</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Price/Unit</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.hsn || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No items listed
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Sub Total:</span>
                  <span className="font-medium text-gray-800">₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold text-gray-800">Total:</span>
                  <span className="font-bold text-gray-800">₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Received (Paid):</span>
                  <span className="font-medium text-green-600">₹{invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-gray-800">Balance (Remaining):</span>
                  <span className="font-bold text-red-600">₹{invoice.remainingAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* EMI Schedule */}
          {invoice.emiDetails && invoice.emiDetails.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">EMI Payment Schedule</h3>
              <div className="space-y-2">
                {invoice.emiDetails.map((emi: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm text-gray-800">₹{emi.amount.toFixed(2)}</span>
                      <span className="text-sm text-gray-600">
                        Due: {new Date(emi.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emi.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {emi.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
