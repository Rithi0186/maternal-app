import React, { useState, useEffect, useRef } from 'react';
import {
  FileSearch,
  UploadCloud,
  History,
  FileText,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Trash2,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { insforge } from '../lib/insforge';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Report {
  id: string;
  name: string;
  url: string;
  path: string;
  file_type: string;
  created_at: string;
}

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await insforge.database
        .from('reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

      const { data: uploadData, error: uploadError } = await insforge.storage
        .from('reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      if (!uploadData?.url) throw new Error('Upload failed: No URL returned');

      const { error: dbError } = await insforge.database
        .from('reports')
        .insert([{
          user_id: user.id,
          name: file.name,
          url: uploadData.url,
          path: uploadData.key || fileName,
          file_type: file.type,
        }]);

      if (dbError) throw dbError;

      await fetchReports();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload report. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteReport = async (report: Report) => {
    if (!confirm(t('confirm_delete') || 'Are you sure?')) return;

    try {
      await insforge.storage.from('reports').remove(report.path);

      const { error } = await insforge.database
        .from('reports')
        .delete()
        .eq('id', report.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchReports();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete report.');
    }
  };

  const filteredReports = reports.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 px-4">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-[#1E293B] mb-3">{t('reports_vault')} 🔐</h1>
        <p className="text-lg text-[#64748B] font-medium max-w-2xl">
          {t('vault_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Upload Zone */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-[#1E293B] flex items-center gap-3">
            <UploadCloud className="text-[#F43F5E]" />
            {t('add_record')}
          </h3>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-96 glass-card border-4 border-dashed border-[#FFE4E6] hover:border-[#F43F5E] flex flex-col items-center justify-center p-12 text-center transition-all cursor-pointer overflow-hidden bg-gradient-to-b from-white to-[#FFF1F2]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F43F5E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {isUploading ? (
              <div className="space-y-6 flex flex-col items-center">
                <Loader2 className="w-20 h-20 text-[#F43F5E] animate-spin" />
                <div className="space-y-2">
                  <p className="text-2xl font-black text-[#1E293B] animate-pulse">{t('securing_file')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex flex-col items-center group-hover:scale-110 transition-transform">
                <div className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center shadow-2xl relative">
                  <FileText size={44} className="text-white relative z-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black text-[#1E293B]">{t('select_medical_report')}</p>
                  <p className="text-lg text-[#64748B] font-medium">PDF, PNG or JPG (max 10MB)</p>
                </div>
                <button className="px-10 py-4 gradient-bg text-white rounded-2xl font-black text-lg shadow-xl hover:premium-shadow active:scale-95 transition-all">
                  {t('add_record')}
                </button>
              </div>
            )}
          </div>

          {/* Privacy Info */}
          <div className="glass-card p-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <AlertTriangle size={32} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-black font-heading">{t('data_safety')}</h4>
              <p className="text-white/70 font-medium leading-relaxed">
                Your medical records are stored in high-security, encrypted cloud storage.
                Only you have the authorization to access or delete these files.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <FileSearch size={220} />
            </div>
          </div>
        </div>

        {/* Right Section: Repository */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-[#1E293B] flex items-center gap-3">
              <History className="text-[#64748B]" />
              {t('vault_records')} ({reports.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input
                type="text"
                placeholder={t('search_records')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white rounded-xl border border-[#FFE4E6] focus:outline-none focus:ring-2 focus:ring-[#F43F5E] font-medium text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredReports.length === 0 && !isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 glass-card bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0]"
                >
                  <FileText className="mx-auto text-[#CBD5E1] mb-4 opacity-50" size={64} />
                  <h5 className="text-xl font-black text-[#64748B]">{t('vault_empty')}</h5>
                </motion.div>
              )}

              {filteredReports.map((report, i) => (
                <motion.div
                  layout
                  key={report.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 flex items-center justify-between group hover:bg-white transition-all ring-1 ring-[#FFE4E6]"
                >
                  <div className="flex items-center gap-5">
                    <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[#1E293B] truncate max-w-[200px]">{report.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#64748B]">{new Date(report.created_at).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]"></span>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t('secure_badge')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[#FFF1F2] hover:premium-shadow transition-all"
                    >
                      <ExternalLink size={24} />
                    </a>
                    <button
                      onClick={() => deleteReport(report)}
                      className="w-12 h-12 rounded-2xl bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 hover:premium-shadow transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
