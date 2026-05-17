import React, { useState, useEffect, useCallback } from 'react';
import { getDefendantInfo } from '../../Axios.jsx';
import { useAuth } from '../../context/useAuth.jsx';
import {
  AlertCircle,
  FileText,
  Download,
  Eye,
  Upload,
  Trash2,
  File,
  Image,
  Film,
  FileArchive,
  Search,
  Filter,
  Calendar,
  User,
  Car,
  Phone,
  Mail,
  MapPin,
  X,
  ChevronRight,
  ChevronLeft,
  Clock
} from 'lucide-react';

const DefendantFile = () => {
  const [defendants, setDefendants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDefendant, setSelectedDefendant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useAuth();

  const transformDefendants = useCallback((apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((def) => ({
      id: def.id,
      defendant: {
        firstname: def.firstname || 'Unknown',
        lastname: def.lastname || '',
        id_no: def.id_no,
        license_no: def.license_no || 'N/A',
        phone_number: def.phone_number || 'N/A',
        email: def.email || 'N/A',
        physical_address: def.physical_address || 'N/A',
        city: def.city || 'N/A',
        headshot_url: def.headshot_url || `https://ui-avatars.com/api/?name=${(def.firstname || 'D')}+${(def.lastname || 'E')}&size=128&background=4f46e5&color=fff&bold=true`
      },
      cases: def.tickets || def.cases || def.case_set || [],
      files: def.defendantfile_set || def.files || def.file_set || []
    }));
  }, []);

  useEffect(() => {
    const fetchDefendants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDefendantInfo();
        const data = Array.isArray(response) ? response : (response?.results || response?.data || []);
        setDefendants(transformDefendants(data));
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Backend unavailable. Contact administrator.');
        setDefendants([]); // No fallback mock - real data only
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDefendants();
  }, [user, transformDefendants]);

  const filteredDefendants = defendants.filter((d) => {
    const fullName = `${d.defendant.firstname} ${d.defendant.lastname}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      d.defendant.id_no.includes(query) ||
      d.defendant.email.toLowerCase().includes(query) ||
      d.defendant.license_no.includes(query)
    );
  });

  const getFileIcon = (fileType) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoTypes = ['mp4', 'webm', 'mov', 'avi'];
    const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];

    const ext = fileType?.toLowerCase() || '';

    if (imageTypes.some((t) => ext.includes(t))) return { icon: Image, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (videoTypes.some((t) => ext.includes(t))) return { icon: Film, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' };
    if (archiveTypes.some((t) => ext.includes(t))) return { icon: FileArchive, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { icon: File, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    court: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    disputed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    paid: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  };

  const FilePreviewModal = ({ file, onClose }) => {
    if (!file) return null;
    const { icon: Icon, color, bg } = getFileIcon(file.type);
    const isImage = file.type?.includes('photo') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white truncate max-w-xs">{file.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{file.size} • {file.uploaded_at}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
          <div className="p-8 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 min-h-[400px]">
            {isImage ? (
              <div className="text-center max-w-4xl">
                <div className="w-96 h-96 bg-slate-200 dark:bg-slate-700 rounded-3xl flex items-center justify-center mb-6 p-8 shadow-2xl">
                  <Image className="w-24 h-24 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Image Preview</p>
                <button className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors font-semibold flex items-center gap-2 mx-auto">
                  <Download className="w-5 h-5" />
                  Download Image
                </button>
              </div>
            ) : (
              <div className="text-center max-w-md">
                <div className="w-64 h-64 bg-slate-200 dark:bg-slate-700 rounded-3xl flex items-center justify-center mb-6 p-8 shadow-2xl border-4 border-dashed border-slate-300 dark:border-slate-600">
                  <FileText className="w-24 h-24 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">Document Preview</p>
                <div className="space-y-2">
                  <button className="w-full px-8 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors font-semibold flex items-center gap-2 justify-center">
                    <Download className="w-5 h-5" />
                    Download File
                  </button>
                  <button className="w-full px-8 py-3 bg-slate-500 text-white rounded-2xl hover:bg-slate-600 transition-colors font-semibold flex items-center gap-2 justify-center">
                    <Eye className="w-5 h-5" />
                    Quick View
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-slate-700 dark:text-slate-300">{file.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const DefendantCard = ({ defendant, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`
        p-6 rounded-3xl border-2 cursor-pointer transition-all group hover:shadow-2xl
        ${isSelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 shadow-blue-200 ring-2 ring-blue-200/50 dark:ring-blue-500/30'
          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm'
        }
      `}
    >
      <div className="flex items-start gap-5">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden group-hover:scale-105 transition-transform ${
          isSelected
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-300 ring-2 ring-white/50'
            : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 shadow-slate-200 dark:shadow-slate-700 hover:shadow-md'
        }`}>
          <img
            src={defendant.headshot_url}
            alt={`${defendant.firstname} ${defendant.lastname}`}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.background = 'linear-gradient(135deg, var(--fallback-b1, #ecdfdf), var(--fallback-b2, #6b7280))';
              e.target.innerHTML = <User className="w-8 h-8 text-slate-400 mx-auto mt-2" />;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xl text-slate-900 dark:text-white truncate mb-1 leading-tight">
            {defendant.firstname} {defendant.lastname}
          </h4>
          <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit text-slate-600 dark:text-slate-400 mb-2">
            ID: {defendant.id_no.slice(0,4)}****{defendant.id_no.slice(-4)}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Car className="w-3 h-3" />
              License: {defendant.license_no.slice(0,4)}****
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {defendant.phone_number.slice(0,4)}***{defendant.phone_number.slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl">
            <Clock className="w-3 h-3 text-blue-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {defendant.cases?.length || 0} Open Cases
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-4">|</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {defendant.files?.length || 0} Files
            </span>
          </div>
        </div>
        {isSelected && (
          <ChevronRight className="w-6 h-6 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
        )}
      </div>
    </div>
  );

  const DefendantDetail = ({ defendantData, onBack, onFileClick }) => {
    const defendant = defendantData.defendant;
    const cases = defendantData.cases || [];
    const files = defendantData.files || [];
    const [activeTab, setActiveTab] = useState('cases');

    return (
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-6 p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl shadow-2xl">
          <button onClick={onBack} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-sm transition-all -ml-3">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <img
                src={defendant.headshot_url}
                alt={defendant.firstname}
                className="w-full max-w-sm h-48 object-cover rounded-3xl shadow-2xl ring-4 ring-white/50"
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-3xl font-black leading-tight">
                {defendant.firstname.toUpperCase()} {defendant.lastname.toUpperCase()}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm bg-white/20 p-4 rounded-3xl backdrop-blur-sm">
                <span className="font-mono bg-white/30 px-4 py-2 rounded-2xl">
                  ID: {defendant.id_no.slice(0,4)}****{defendant.id_no.slice(-4)}
                </span>
                <span className="font-mono bg-white/30 px-4 py-2 rounded-2xl">
                  License: {defendant.license_no.slice(0,6)}**
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-1">
          <div className="group p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{cases.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Cases</p>
              </div>
            </div>
          </div>
          <div className="group p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{files.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Case Files</p>
              </div>
            </div>
          </div>
          <div className="group p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {cases.filter(c => c.status === 'court').length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Court Pending</p>
              </div>
            </div>
          </div>
          <div className="group p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {cases.filter(c => c.status === 'disputed').length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Disputed</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-3xl shadow-inner gap-2">
          <button
            onClick={() => setActiveTab('cases')}
            className={`flex-1 p-4 rounded-2xl font-semibold transition-all group ${
              activeTab === 'cases'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            Violations ({cases.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 p-4 rounded-2xl font-semibold transition-all group ${
              activeTab === 'files'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            Evidence ({files.length})
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 p-4 rounded-2xl font-semibold transition-all group ${
              activeTab === 'contact'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            Contact
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1">
          {activeTab === 'cases' && (
            <div className="lg:col-span-2 space-y-4">
              {cases.map((caseItem) => (
                <div key={caseItem.id} className="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden">
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-2">
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
                        {caseItem.ticket_number}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-mono">{caseItem.plate_no}</span>
                        <span>{caseItem.location}</span>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-2xl text-sm font-bold ${statusColors[caseItem.status] || statusColors.pending}`}>
                      {caseItem.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">Violation</span>
                      <p className="font-semibold text-slate-900 dark:text-white capitalize">{caseItem.violation_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Amount</span>
                      <p className="text-2xl font-bold text-emerald-600">N${caseItem.amount}</p>
                    </div>
                  </div>
                </div>
              ))}
              {cases.length === 0 && (
                <div className="p-20 text-center rounded-3xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600">
                  <Car className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Violations</h3>
                  <p className="text-slate-500 dark:text-slate-400">No traffic violations recorded for this defendant.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => {
                  const { icon: Icon, color, bg } = getFileIcon(file.type);
                  return (
                    <div
                      key={file.id}
                      onClick={() => onFileClick(file)}
                      className="group p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-2xl hover:scale-[1.02] transition-all overflow-hidden hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-500/5 dark:hover:to-indigo-500/5"
                    >
                      <div className="flex items-start gap-5 mb-4">
                        <div className={`p-4 rounded-2xl shadow-lg ${bg} group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-8 h-8 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-900 dark:text-white truncate text-lg mb-1">{file.name}</h5>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{file.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {file.uploaded_at}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm">
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors flex items-center justify-center">
                          <Download className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {files.length === 0 && (
                  <div className="col-span-full p-20 text-center rounded-3xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600">
                    <FileText className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Evidence</h3>
                    <p className="text-slate-500 dark:text-slate-400">No files uploaded for this case.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <MapPin className="w-8 h-8 bg-slate-200 dark:bg-slate-700 p-2 rounded-2xl text-slate-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Phone</label>
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border">
                      <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="font-mono text-lg">{defendant.phone_number}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Email</label>
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border">
                      <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="font-mono text-lg break-all">{defendant.email}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Address</label>
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border min-h-[100px]">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900 dark:text-white text-lg">{defendant.physical_address}</p>
                          <p className="text-slate-600 dark:text-slate-400 font-mono">{defendant.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-8"></div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Loading Case Files...</h2>
          <p className="text-slate-500 dark:text-slate-400">Fetching defendant records from backend</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight mb-3">
              Defendant Case Files
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-semibold">Manage defendant records and evidence</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {defendants.length} Records Loaded
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search defendants by name, ID, license or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-xl text-lg placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* LIST & DETAIL */}
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            {filteredDefendants.map((defendant) => (
              <DefendantCard
                key={defendant.id}
                defendant={defendant.defendant}
                isSelected={selectedDefendant?.id === defendant.id}
                onClick={() => setSelectedDefendant(defendant)}
              />
            ))}
            {filteredDefendants.length === 0 && !loading && (
              <div className="p-24 text-center rounded-3xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-2 border-dashed border-slate-300 dark:border-slate-600 col-span-full">
                <User className="w-24 h-24 text-slate-400 mx-auto mb-8" />
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">No Defendants Found</h3>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {searchQuery ? 'Try adjusting your search terms.' : 'No defendant records available. Cases will appear here when assigned.'}
                </p>
              </div>
            )}
          </div>

          <div>
            {selectedDefendant ? (
              <DefendantDetail
                defendantData={selectedDefendant}
                onBack={() => setSelectedDefendant(null)}
                onFileClick={setSelectedFile}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-20 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600">
                <div className="text-center">
                  <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <User className="w-16 h-16 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Select a Defendant</h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">Click on any defendant to view case details</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Backend-connected • Real-time data • Live updates</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedFile && <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />}

      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 text-white p-6 rounded-3xl shadow-2xl max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <AlertCircle className="w-8 h-8 flex-shrink-0" />
              <h4 className="font-bold text-xl">Backend Connection Error</h4>
            </div>
            <p className="text-red-100 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-red-400 hover:bg-red-300 text-white py-3 px-6 rounded-2xl font-semibold transition-colors"
              >
                Retry Connection
              </button>
              <button
                onClick={() => setError(null)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-900 py-3 px-6 rounded-2xl font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DefendantFile;
