'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditInvoice({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [items, setItems] = useState([{ itemName: '', hsn: '', quantity: 1, price: 0 }]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [emiDetails, setEmiDetails] = useState([{ amount: 0, dueDate: '', status: 'pending' }]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/invoices/${id}`);
        const data = response.data;
        setClientName(data.clientName);
        setAccountNumber(data.accountNumber);
        setItems(data.items || []);
        setPaidAmount(data.paidAmount);
        // Format dates for input[type="date"]
        const formattedEmis = data.emiDetails.map((emi: any) => ({
          ...emi,
          dueDate: emi.dueDate ? new Date(emi.dueDate).toISOString().split('T')[0] : ''
        }));
        setEmiDetails(formattedEmis);
      } catch (error) {
        console.error('Error fetching invoice', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const addItem = () => {
    setItems([...items, { itemName: '', hsn: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addEmi = () => {
    setEmiDetails([...emiDetails, { amount: 0, dueDate: '', status: 'pending' }]);
  };

  const removeEmi = (index: number) => {
    const newEmis = [...emiDetails];
    newEmis.splice(index, 1);
    setEmiDetails(newEmis);
  };

  const handleEmiChange = (index: number, field: string, value: any) => {
    const newEmis = [...emiDetails];
    (newEmis[index] as any)[field] = value;
    setEmiDetails(newEmis);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invoice = {
      clientName,
      accountNumber,
      items,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
      emiDetails,
    };

    try {
      await axios.patch(`http://127.0.0.1:5000/invoices/${id}`, invoice);
      router.push('/');
    } catch (error) {
      console.error('Error updating invoice', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Edit Invoice</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <input 
                type="text" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input 
                type="text" 
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Paid Amount (First Installment)</label>
              <input 
                type="number" 
                value={paidAmount} 
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" 
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Items</h2>
              <button 
                type="button" 
                onClick={addItem}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus size={20} className="mr-1" /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Item Name</label>
                    <input 
                      type="text" 
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Qty</label>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Price</label>
                    <input 
                      type="number" 
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:text-red-700 flex justify-center"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">EMI Schedule</h2>
              <button 
                type="button" 
                onClick={addEmi}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus size={20} className="mr-1" /> Add EMI
              </button>
            </div>
            
            <div className="space-y-4">
              {emiDetails.map((emi, index) => (
                <div key={index} className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Amount</label>
                    <input 
                      type="number" 
                      value={emi.amount}
                      onChange={(e) => handleEmiChange(index, 'amount', Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Due Date</label>
                    <input 
                      type="date" 
                      value={emi.dueDate}
                      onChange={(e) => handleEmiChange(index, 'dueDate', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeEmi(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t">
            <div className="flex justify-between items-center text-lg font-bold text-gray-800 mb-6">
              <span>Updated Remaining Amount:</span>
              <span className="text-blue-600">₹{totalAmount - paidAmount}</span>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
              Update Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
