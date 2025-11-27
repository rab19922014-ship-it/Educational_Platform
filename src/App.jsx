import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, CheckCircle, 
  BarChart2, Settings, LogOut, Video, FileText, 
  MessageSquare, User, Bell, Plus, Trash2, CheckSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Mock Database & Services (محاكاة قاعدة البيانات) ---
const initialData = {
  users: [
    { id: 1, name: 'أحمد المدير', role: 'admin', email: 'admin@school.com', password: '123' },
    { id: 2, name: 'أ. محمد فوزي', role: 'teacher', email: 'teacher@school.com', password: '123', subject: 'الرياضيات' },
    { id: 3, name: 'الطالب عمر', role: 'student', email: 'student@school.com', password: '123', grade: 'الصف الأول الثانوي', parentId: 4 },
    { id: 4, name: 'ولي الأمر (والد عمر)', role: 'parent', email: 'parent@school.com', password: '123', studentIds: [3] },
  ],
  lessons: [
    { id: 101, title: 'مقدمة في الجبر', subject: 'الرياضيات', grade: 'الصف الأول الثانوي', type: 'video', url: '#', teacherId: 2 },
    { id: 102, title: 'ملخص الهندسة', subject: 'الرياضيات', grade: 'الصف الأول الثانوي', type: 'pdf', url: '#', teacherId: 2 },
  ],
  assignments: [
    { id: 201, title: 'واجب الدرس الأول', subject: 'الرياضيات', dueDate: '2023-11-30', grade: 'الصف الأول الثانوي' }
  ],
  grades: [
    { id: 301, studentId: 3, exam: 'اختبار شهر أكتوبر', score: 18, total: 20, subject: 'الرياضيات' }
  ],
  messages: []
};

// خدمة إدارة البيانات (LocalStorage Wrapper)
const db = {
  get: (key) => {
    try {
      const item = localStorage.getItem(`lms_${key}`);
      return item ? JSON.parse(item) : initialData[key];
    } catch (e) {
      return initialData[key];
    }
  },
  set: (key, data) => localStorage.setItem(`lms_${key}`, JSON.stringify(data)),
  init: () => {
    Object.keys(initialData).forEach(key => {
      if (!localStorage.getItem(`lms_${key}`)) {
        localStorage.setItem(`lms_${key}`, JSON.stringify(initialData[key]));
      }
    });
  }
};

// --- Components ---

// 1. Login Component
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const users = db.get('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  // Quick login for demo
  const quickLogin = (role) => {
    const users = db.get('users');
    const user = users.find(u => u.role === role);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">منصتي التعليمية</h1>
          <p className="text-gray-500">بوابة التعليم الذكي للمناهج العربية</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            دخول
          </button>
        </form>

        <div className="mt-8 border-t pt-4">
          <p className="text-center text-sm text-gray-400 mb-2">دخول سريع (للتجربة)</p>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => quickLogin('student')} className="text-xs bg-green-100 text-green-700 p-2 rounded">طالب</button>
            <button onClick={() => quickLogin('teacher')} className="text-xs bg-purple-100 text-purple-700 p-2 rounded">معلم</button>
            <button onClick={() => quickLogin('parent')} className="text-xs bg-orange-100 text-orange-700 p-2 rounded">ولي أمر</button>
            <button onClick={() => quickLogin('admin')} className="text-xs bg-red-100 text-red-700 p-2 rounded">إدارة</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Sidebar
const Sidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  const menuItems = {
    student: [
      { id: 'dashboard', label: 'الرئيسية', icon: BarChart2 },
      { id: 'lessons', label: 'دروسي', icon: BookOpen },
      { id: 'exams', label: 'الاختبارات والواجبات', icon: FileText },
      { id: 'grades', label: 'درجاتي', icon: CheckCircle },
    ],
    teacher: [
      { id: 'dashboard', label: 'لوحة التحكم', icon: BarChart2 },
      { id: 'manage-lessons', label: 'إدارة الدروس', icon: Video },
      { id: 'manage-exams', label: 'إدارة الاختبارات', icon: FileText },
      { id: 'students', label: 'الطلاب', icon: Users },
    ],
    parent: [
      { id: 'dashboard', label: 'ملخص التحصيل', icon: BarChart2 },
      { id: 'reports', label: 'التقارير', icon: FileText },
      { id: 'contact', label: 'تواصل مع المعلم', icon: MessageSquare },
    ],
    admin: [
      { id: 'dashboard', label: 'نظرة عامة', icon: BarChart2 },
      { id: 'users', label: 'إدارة المستخدمين', icon: Users },
      { id: 'schedule', label: 'الجداول', icon: Calendar },
      { id: 'settings', label: 'الإعدادات', icon: Settings },
    ]
  };

  const currentMenu = menuItems[user.role] || [];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen fixed right-0 top-0 z-10 border-l">
      <div className="p-6 border-b flex items-center justify-center flex-col">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
          <User size={32} />
        </div>
        <h3 className="font-bold text-gray-800">{user.name}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1">
          {user.role === 'student' ? 'طالب' : user.role === 'teacher' ? 'معلم' : user.role === 'parent' ? 'ولي أمر' : 'مدير النظام'}
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {currentMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg">
          <LogOut size={20} />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
};

// 3. Components

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const StudentLessons = () => {
  const lessons = db.get('lessons');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map(lesson => (
        <div key={lesson.id} className="bg-white rounded-xl shadow-sm overflow-hidden border hover:shadow-md transition">
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            {lesson.type === 'video' ? <Video size={40} className="text-red-500" /> : <FileText size={40} className="text-blue-500" />}
          </div>
          <div className="p-4">
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">{lesson.subject}</span>
            <h3 className="font-bold text-lg mt-2">{lesson.title}</h3>
            <button className="mt-4 w-full py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
              مشاهدة الدرس
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const StudentGrades = ({ user }) => {
  const allGrades = db.get('grades');
  const myGrades = allGrades.filter(g => g.studentId === user.id);
  
  const data = myGrades.map(g => ({ name: g.subject, score: g.score }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4">تحليل الأداء</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">المادة</th>
              <th className="p-4">الاختبار</th>
              <th className="p-4">الدرجة</th>
              <th className="p-4">التقدير</th>
            </tr>
          </thead>
          <tbody>
            {myGrades.map(grade => (
              <tr key={grade.id} className="border-t">
                <td className="p-4">{grade.subject}</td>
                <td className="p-4">{grade.exam}</td>
                <td className="p-4 font-bold">{grade.score}/{grade.total}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${(grade.score/grade.total) > 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {(grade.score/grade.total) > 0.8 ? 'ممتار' : 'جيد'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TeacherLessonManager = ({ user }) => {
  const [lessons, setLessons] = useState(db.get('lessons'));
  const [newLesson, setNewLesson] = useState({ title: '', subject: user.subject || 'عام', type: 'video' });

  const addLesson = () => {
    if(!newLesson.title) return;
    const updatedLessons = [...lessons, { ...newLesson, id: Date.now(), teacherId: user.id }];
    setLessons(updatedLessons);
    db.set('lessons', updatedLessons);
    setNewLesson({ title: '', subject: user.subject || 'عام', type: 'video' });
  };

  const deleteLesson = (id) => {
    const updatedLessons = lessons.filter(l => l.id !== id);
    setLessons(updatedLessons);
    db.set('lessons', updatedLessons);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4">إضافة درس جديد</h3>
        <div className="flex gap-4">
          <input 
            className="flex-1 p-2 border rounded" 
            placeholder="عنوان الدرس" 
            value={newLesson.title}
            onChange={e => setNewLesson({...newLesson, title: e.target.value})}
          />
          <select 
            className="p-2 border rounded"
            value={newLesson.type}
            onChange={e => setNewLesson({...newLesson, type: e.target.value})}
          >
            <option value="video">فيديو</option>
            <option value="pdf">ملف PDF</option>
          </select>
          <button onClick={addLesson} className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2">
            <Plus size={18} /> إضافة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <h3 className="font-bold p-6 border-b">الدروس الحالية</h3>
        {lessons.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">لا توجد دروس مضافة</p>
        ) : (
          <div className="divide-y">
            {lessons.map(lesson => (
              <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded text-blue-600">
                    {lesson.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold">{lesson.title}</h4>
                    <p className="text-xs text-gray-500">{lesson.subject}</p>
                  </div>
                </div>
                <button onClick={() => deleteLesson(lesson.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminUserManager = () => {
  const [users, setUsers] = useState(db.get('users'));
  const [newUser, setNewUser] = useState({ name: '', role: 'student', email: '' });

  const addUser = () => {
    if(!newUser.name || !newUser.email) return;
    const updatedUsers = [...users, { ...newUser, id: Date.now(), password: '123' }];
    setUsers(updatedUsers);
    db.set('users', updatedUsers);
    setNewUser({ name: '', role: 'student', email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4">إضافة مستخدم جديد</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            className="p-2 border rounded" 
            placeholder="الاسم" 
            value={newUser.name}
            onChange={e => setNewUser({...newUser, name: e.target.value})}
          />
          <input 
            className="p-2 border rounded" 
            placeholder="البريد الإلكتروني" 
            value={newUser.email}
            onChange={e => setNewUser({...newUser, email: e.target.value})}
          />
          <select 
            className="p-2 border rounded"
            value={newUser.role}
            onChange={e => setNewUser({...newUser, role: e.target.value})}
          >
            <option value="student">طالب</option>
            <option value="teacher">معلم</option>
            <option value="parent">ولي أمر</option>
          </select>
          <button onClick={addUser} className="bg-green-600 text-white py-2 rounded">إضافة</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">الدور</th>
              <th className="p-4">البريد</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-bold">{u.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.role === 'admin' ? 'bg-red-100 text-red-700' :
                    u.role === 'teacher' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'student' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {u.role === 'student' ? 'طالب' : u.role === 'teacher' ? 'معلم' : u.role === 'parent' ? 'ولي أمر' : 'مدير'}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4">
                  <button className="text-blue-500 hover:underline">تعديل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ParentDashboard = ({ user }) => {
  const allUsers = db.get('users');
  const grades = db.get('grades');
  const students = allUsers.filter(u => user.studentIds?.includes(u.id));

  return (
    <div className="space-y-6">
      {students.map(student => {
        const studentGrades = grades.filter(g => g.studentId === student.id);
        return (
          <div key={student.id} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="font-bold text-lg text-blue-800">تقرير الطالب: {student.name}</h3>
              <span className="text-sm text-gray-500">{student.grade}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <h4 className="font-bold mb-2 text-sm text-gray-600">آخر الدرجات:</h4>
                 {studentGrades.length > 0 ? (
                   <ul className="space-y-2">
                     {studentGrades.map(g => (
                       <li key={g.id} className="flex justify-between bg-gray-50 p-2 rounded">
                         <span>{g.subject} ({g.exam})</span>
                         <span className="font-bold text-green-600">{g.score}/{g.total}</span>
                       </li>
                     ))}
                   </ul>
                 ) : <p className="text-sm text-gray-400">لا توجد درجات مسجلة بعد</p>}
              </div>
              <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                <h4 className="font-bold mb-2 text-sm text-yellow-800">ملاحظات المعلم:</h4>
                <p className="text-sm text-gray-600">الطالب مجتهد ولكن يحتاج للتركيز في مادة الرياضيات أكثر.</p>
                <button className="mt-4 text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300">
                  تواصل مع المعلم
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MainLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (user.role) {
      case 'student':
        if (activeTab === 'lessons') return <StudentLessons />;
        if (activeTab === 'grades') return <StudentGrades user={user} />;
        if (activeTab === 'exams') return <div className="text-center p-10">قريباً: صفحة الاختبارات</div>;
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="الدروس المكتملة" value="12" icon={CheckSquare} color="bg-green-500" />
            <StatCard title="الواجبات المعلقة" value="3" icon={FileText} color="bg-orange-500" />
            <StatCard title="المعدل العام" value="92%" icon={BarChart2} color="bg-blue-500" />
            <div className="md:col-span-2"><StudentGrades user={user} /></div>
          </div>
        );

      case 'teacher':
        if (activeTab === 'manage-lessons') return <TeacherLessonManager user={user} />;
        if (activeTab === 'students') return <div className="text-center p-10">قريباً: إدارة الطلاب</div>;
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="عدد الطلاب" value="45" icon={Users} color="bg-purple-500" />
            <StatCard title="الدروس المرفوعة" value="24" icon={Video} color="bg-blue-500" />
            <StatCard title="الواجبات للتصحيح" value="8" icon={FileText} color="bg-red-500" />
            <div className="md:col-span-3"><TeacherLessonManager user={user} /></div>
          </div>
        );

      case 'admin':
        if (activeTab === 'users') return <AdminUserManager />;
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="إجمالي الطلاب" value="1,250" icon={Users} color="bg-blue-500" />
            <StatCard title="المعلمين" value="64" icon={Users} color="bg-purple-500" />
            <StatCard title="أولياء الأمور" value="900" icon={User} color="bg-orange-500" />
            <StatCard title="نسبة الحضور" value="95%" icon={CheckCircle} color="bg-green-500" />
            <div className="md:col-span-4"><AdminUserManager /></div>
          </div>
        );

      case 'parent':
        return <ParentDashboard user={user} />;

      default:
        return <div>Unknown Role</div>;
    }
  };

  return (
    <>
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      <div className="flex-1 mr-64">
         <div className="bg-gray-50 min-h-screen p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === 'dashboard' ? 'لوحة المعلومات' : 
                 activeTab === 'users' ? 'إدارة المستخدمين' :
                 activeTab === 'manage-lessons' ? 'إدارة الدروس' :
                 activeTab === 'lessons' ? 'مكتبة الدروس' :
                 activeTab === 'grades' ? 'الدرجات' :
                 'الصفحة الحالية'}
              </h2>
              <div className="flex gap-4">
                 <button className="p-2 bg-white rounded-full shadow-sm relative">
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                 </button>
                 <span className="text-sm text-gray-500 mt-2">السنة الدراسية 2024-2025</span>
              </div>
            </div>
            
            {renderContent()}
         </div>
      </div>
    </>
  );
};

// Main App Logic
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    db.init(); // Initialize Mock Data if empty
    const savedUser = sessionStorage.getItem('lms_current_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('lms_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('lms_current_user');
  };

  return (
    <>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="flex font-sans" dir="rtl">
          <MainLayout user={user} onLogout={handleLogout} />
        </div>
      )}
    </>
  );
}