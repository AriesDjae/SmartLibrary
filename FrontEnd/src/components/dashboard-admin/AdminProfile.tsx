// import React, { useRef, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';

// export const AdminProfile: React.FC = () => {
//   const { user, updateProfile } = useAuth();
//   const [name, setName] = useState(user?.name || '');
//   const [email, setEmail] = useState(user?.email || '');
//   const [avatar, setAvatar] = useState(user?.avatar || '');
//   const [preview, setPreview] = useState(user?.avatar || '');
//   const [saving, setSaving] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//       setAvatar(URL.createObjectURL(file));
//     }
//   };

//   const handleSave = (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setTimeout(() => {
//       updateProfile({ name, email, avatar: preview });
//       setSaving(false);
//     }, 800);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-8 px-2">
//       <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 px-0 py-0 overflow-hidden">
//         <div className="grid grid-cols-1 lg:grid-cols-2">
//           {/* Kiri: Avatar & Info */}
//           <div className="flex flex-col items-center justify-center py-10 px-6 md:px-12 bg-white dark:bg-gray-800">
//             <div className="relative mb-4">
//               <img
//                 src={preview || '/default-avatar.png'}
//                 alt="Profile"
//                 className="w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-purple-200 dark:border-purple-700 shadow-xl bg-gray-100 dark:bg-gray-700"
//               />
//               <button
//                 type="button"
//                 className="absolute bottom-2 right-2 bg-primary-500 text-white rounded-full p-2 shadow hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
//                 onClick={() => fileInputRef.current?.click()}
//                 title="Change photo"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6 6M9 13l-6-6m6 6V3m0 10v8" /></svg>
//               </button>
//               <input
//                 type="file"
//                 accept="image/*"
//                 ref={fileInputRef}
//                 className="hidden"
//                 onChange={handleAvatarChange}
//               />
//             </div>
//             <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 mb-2 tracking-wide shadow">Admin</span>
//             <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 transition-all duration-200">{name}</div>
//             <div className="text-sm text-gray-500 dark:text-gray-300">{email}</div>
//           </div>
//           {/* Kanan: Form */}
//           <div className="flex flex-col justify-center px-6 py-10 md:px-12">
//             <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Admin Profile</h2>
//             <p className="text-sm md:text-base text-gray-500 dark:text-gray-300 mb-6">Kelola informasi akun admin Anda. Data profil di bawah ini akan digunakan untuk identitas dan notifikasi di sistem Smart Library.</p>
//             <form onSubmit={handleSave} className="flex flex-col gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
//                 <input
//                   type="text"
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-200 focus:outline-none text-base transition"
//                   value={name}
//                   onChange={e => setName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
//                 <input
//                   type="email"
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-200 focus:outline-none text-base transition"
//                   value={email}
//                   onChange={e => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold shadow hover:from-primary-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-primary-200 transition disabled:opacity-60 text-base"
//                 disabled={saving}
//               >
//                 {saving ? 'Saving...' : 'Save'}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // tailwind.config.js: tambahkan animasi custom jika ingin efek spin-slow dan fade-in
// // extend: { animation: { 'spin-slow': 'spin 2.5s linear infinite', 'fade-in': 'fadeIn 0.7s ease-in' }, keyframes: { fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } } } } 