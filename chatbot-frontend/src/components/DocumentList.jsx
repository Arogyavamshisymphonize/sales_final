import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Calendar, File } from 'lucide-react';
import { chatAPI } from '../services/api';
import toast from '../utils/toast';
import './DocumentList.css';

export default function DocumentList() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const docs = await chatAPI.listDocuments();
            setDocuments(docs || []);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (loading) return <div className="documents-loading">Loading documents...</div>;

    if (documents.length === 0) {
        return (
            <div className="documents-empty">
                <FileText size={48} strokeWidth={1} />
                <p>No documents uploaded yet</p>
            </div>
        );
    }

    return (
        <div className="document-list">
            <h3>Uploaded Documents</h3>
            <div className="documents-grid">
                {documents.map(doc => (
                    <div key={doc.id} className="document-card">
                        <div className="document-icon">
                            <File size={24} />
                        </div>
                        <div className="document-info">
                            <div className="document-name" title={doc.filename}>{doc.filename}</div>
                            <div className="document-meta">
                                <span>{formatSize(doc.file_size)}</span>
                                <span>•</span>
                                <span>{formatDate(doc.created_at)}</span>
                            </div>
                        </div>
                        {/* Download/Action buttons could go here */}
                    </div>
                ))}
            </div>
        </div>
    );
}
