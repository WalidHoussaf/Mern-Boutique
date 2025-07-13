import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import BackToDashboard from '../../components/BackToDashboard';
import useTranslation from '../../utils/useTranslation';

const Messages = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get('/api/contact');
      setMessages(data);
    } catch (error) {
      toast.error(t('failed_fetch_messages'));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/contact/${id}`);
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, isRead: true } : msg
      ));
      toast.success(t('message_marked_read'));
    } catch (error) {
      toast.error(t('failed_update_message'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_message'))) {
      try {
        await axios.delete(`/api/contact/${id}`);
        setMessages(messages.filter(msg => msg._id !== id));
        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }
        toast.success(t('message_deleted_successfully'));
      } catch (error) {
        toast.error(t('failed_delete_message'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <BackToDashboard />
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{t('contact_messages')}</h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {messages.filter(msg => !msg.isRead).length} {t('unread')}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="border rounded-lg overflow-hidden">
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {t('no_messages_found')}
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedMessage?._id === message._id
                          ? 'bg-primary/5'
                          : 'hover:bg-gray-50'
                      } ${!message.isRead ? 'bg-blue-50/50' : ''}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800">
                          {message.name}
                          {!message.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{message.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{message.email}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Message Details */}
            <div className="border rounded-lg p-6">
              {selectedMessage ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {selectedMessage.name}
                      </h3>
                      <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      {!selectedMessage.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(selectedMessage._id)}
                          className="text-sm px-3 py-1 rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                        >
                          {t('mark_as_read')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(selectedMessage._id)}
                        className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{t('subject')}</h4>
                    <p className="text-gray-600">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{t('message')}</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      {t('received_on')} {format(new Date(selectedMessage.createdAt), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  {t('select_message')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 