import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createArticle, updateArticle, getArticleById, updateImage } from '../../services/blogApi';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { FaSpinner, FaUpload, FaTrash } from 'react-icons/fa';
import ImageDropAndPaste from 'quill-image-drop-and-paste';


Quill.register('modules/imageDropAndPaste', ImageDropAndPaste);

// Componente per l'uploader dell'immagine di copertina
const FeaturedImageUploader = ({ value, onChange, onUploading }) => {
  const [imgUploading, setImgUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImgUploading(true);
    onUploading(true);
    const fd = new FormData();
    fd.append('image', file);

    try {
      const { data } = await updateImage(fd);
      const imageUrl = data?.imageUrl || data?.url || data?.path;
      if (!imageUrl) throw new Error('URL dell\'immagine non trovato nella risposta.');

      const finalUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.REACT_APP_BACKEND_URL_IMAGE}${imageUrl}`;
      onChange(finalUrl);
      toast.success('Immagine caricata!');
    } catch (err) {
      toast.error(err.message || 'Errore durante il caricamento');
    } finally {
      setImgUploading(false);
      onUploading(false);
    }
  };

  return (
    <div className=" border-2 border-dashed rounded-lg p-4 text-center">
      {value ? (
        <div>
          <img src={value} alt="Anteprima" className="w-full h-auto rounded-md shadow-md mb-4" />
          <button type="button" onClick={() => onChange('')} className="text-red-500 hover:text-red-700 text-sm inline-flex items-center">
            <FaTrash className="mr-1 text-black" /> Rimuovi immagine
          </button>
        </div>
      ) : (
        <div>
          <label htmlFor="ogImage-upload" className="cursor-pointer">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <span className="text-indigo-600 font-semibold">Carica un'immagine</span>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
          </label>
          <input id="ogImage-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={imgUploading} />
        </div>
      )}
      {imgUploading && <div className="mt-2 flex items-center justify-center text-sm"><FaSpinner className="animate-spin mr-2" /> Caricamento...</div>}
    </div>
  );
}

const ArticleEditor = () => {
  const { id: articleId } = useParams();
  const isEditing = !!articleId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [activeLang, setActiveLang] = useState('it'); // 'it' o 'en'

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: { it: '', en: '' },
      content: { it: '', en: '' },
      status: 'draft',
      publishedAt: '',
      categories: '',
      tags: '',
      ogImage: ''
    }
  });

  useEffect(() => {
    if (isEditing) {
      const fetchArticle = async () => {
        try {
          const { data } = await getArticleById(articleId);
          reset({
            ...data,
            categories: data.categories?.join(', ') || '',
            tags: data.tags?.join(', ') || '',
            ogImage: data.ogImage || '',
            publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : ''
          });
        } catch (e) {
          toast.error("Articolo non trovato");
          navigate('/admin/blog');
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [isEditing, articleId, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        categories: data.categories.split(',').map(c => c.trim()).filter(Boolean),
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        meta: {
          title: data.title,
          description: {
            it: data.content.it.replace(/<[^>]+>/g, '').slice(0, 160),
            en: data.content.en.replace(/<[^>]+>/g, '').slice(0, 160)
          }
        },
      };

      if (data.publishedAt) {
        payload.publishedAt = new Date(data.publishedAt);
      } else {
        delete payload.publishedAt;
      }

      if (isEditing) {
        await updateArticle(articleId, payload);
        toast.success("Articolo aggiornato con successo!");
      } else {
        await createArticle(payload);
        toast.success("Articolo creato con successo!");
      }
      navigate('/admin/blog');
    } catch (error) {
      const errorMsg = error.response?.data?.messages?.[0] || "Si è verificato un errore.";
      toast.error(errorMsg);
    }
  };

  

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
      [{ align: [] }],
      ['link', 'image', 'code-block', 'blockquote'],
      [ 'video'], 
      ['clean'],
    ],
    imageDropAndPaste: true 
  };



  if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-indigo-600" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=" min-h-screen">
      {/* Action Bar Fissa */}
      <div className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{isEditing ? `Modifica: ${watch('title.it') || 'Articolo'}` : 'Nuovo Articolo'}</h1>
          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105">
            {isSubmitting ? <FaSpinner className="animate-spin" /> : (isEditing ? 'Aggiorna' : 'Pubblica')}
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Colonna Principale (Contenuto) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Lingua */}
            <div className="flex border-b">
              <button type="button" onClick={() => setActiveLang('it')} className={`px-4 py-2 font-semibold ${activeLang === 'it' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Italiano</button>
              <button type="button" onClick={() => setActiveLang('en')} className={`px-4 py-2 font-semibold ${activeLang === 'en' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Inglese</button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Campi specifici per lingua */}
              <div className={activeLang === 'it' ? 'block' : 'hidden'}>
                <label className="text-sm font-bold text-gray-700">Titolo (IT)</label>
                <input {...register('title.it', { required: 'Il titolo in italiano è obbligatorio' })} className="text-black w-full text-2xl p-2 border-b-2 mt-1 mb-6 focus:outline-none focus:border-indigo-500" placeholder="Il titolo" />
                {errors.title?.it && <span className="text-red-500 text-sm">{errors.title.it.message}</span>}

                <label className="text-sm font-bold text-gray-700">Contenuto (IT)</label>
                <Controller name="content.it" control={control} rules={{ required: true }} render={({ field }) => <ReactQuill theme="snow" {...field} modules={modules} style={{ color: 'black', minHeight: '200px' }} // testo nero
 />} />
                {errors.content?.it && <span className="text-red-500 text-sm">Il contenuto in italiano è obbligatorio</span>}
              </div>
              <div className={activeLang === 'en' ? 'block' : 'hidden'}>
                <label className="text-sm font-bold text-gray-700">Titolo (EN)</label>
                <input {...register('title.en', { required: 'Il titolo in inglese è obbligatorio' })} className="text-black w-full text-2xl p-2 border-b-2 mt-1 mb-6 focus:outline-none focus:border-indigo-500" placeholder="My awesome title" />
                {errors.title?.en && <span className="text-red-500 text-sm">{errors.title.en.message}</span>}

                <label className="text-sm font-bold text-gray-700">Contenuto (EN)</label>
                <Controller name="content.en" control={control} rules={{ required: true }} render={({ field }) => <ReactQuill theme="snow" {...field} modules={modules}       style={{ color: 'black', minHeight: '200px' }} // testo nero
/>} />
                {errors.content?.en && <span className="text-red-500 text-sm">Il contenuto in inglese è obbligatorio</span>}
              </div>
            </div>
          </div>

          {/* Sidebar (Metadati) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-black">Impostazioni</h3>
              <div>
                <label className="font-bold text-sm text-gray-700 text-black">Stato</label>
                <select {...register('status')} className="text-black w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="draft">Bozza</option>
                  <option value="published">Pubblicato</option>
                  <option value="scheduled">Programmato</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="font-bold text-sm text-gray-700">Data Pubblicazione (opzionale)</label>
                <input type="datetime-local" {...register('publishedAt')} className="text-black w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-black">Organizzazione</h3>
              <div>
                <label className="font-bold text-sm text-gray-700 text-black">Categorie (separate da virgola)</label>
                <input {...register('categories')} className="text-black w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="es. News, Tutorial" />
              </div>
              <div className="mt-4">
                <label className="font-bold text-sm text-gray-700">Tag (separati da virgola)</label>
                <input {...register('tags')} className="text-black w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="es. rettili, terrari" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold border-b pb-2 mb-4 text-black">Immagine di Copertina</h3>
              <Controller
                name="ogImage"
                control={control}
                render={({ field }) => <FeaturedImageUploader value={field.value} onChange={field.onChange} onUploading={(status) => { /* potresti disabilitare il form qui se vuoi */ }} />}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ArticleEditor;