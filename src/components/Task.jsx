import React, { useState, useEffect } from 'react';
import { Plus, History, Trash2, CheckCircle2, Circle, X, CheckSquare, RefreshCw } from 'lucide-react';

export default function Task({ darkMode = true }) {
  // Task Aktif
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('waktura_task_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: '1',
        title: 'Buy movie tickets for friday!',
        date: '2026-10-23',
        time: 'All day',
        tag: '',
        subtasks: [],
        completed: false,
        completedAt: null,
      },
    ];
  });

  // State Riwayat Task (Menyimpan Task Selesai & Task Dihapus)
  const [historyTasks, setHistoryTasks] = useState(() => {
    const savedHistory = localStorage.getItem('waktura_task_history');
    if (savedHistory) {
      try { return JSON.parse(savedHistory); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAllDay, setIsAllDay] = useState(true);
  const [newTime, setNewTime] = useState('10:00');
  const [newTag, setNewTag] = useState('');
  
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasksList, setSubtasksList] = useState([]);

  // Simpan ke localStorage
  useEffect(() => {
    localStorage.setItem('waktura_task_list', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('waktura_task_history', JSON.stringify(historyTasks));
  }, [historyTasks]);

  const getCleanDateString = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysDifference = (targetDateStr) => {
    const todayStr = getCleanDateString(new Date());
    const today = new Date(todayStr);
    const target = new Date(targetDateStr);
    const diffTime = target - today;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddSubtaskItem = () => {
    if (!subtaskInput.trim()) return;
    setSubtasksList([...subtasksList, { id: Date.now().toString(), title: subtaskInput.trim(), completed: false }]);
    setSubtaskInput('');
  };

  const handleRemoveSubtaskItem = (id) => {
    setSubtasksList(subtasksList.filter((s) => s.id !== id));
  };

  const openAddModal = () => {
    setEditingTaskId(null);
    setNewTitle('');
    setNewDate(getCleanDateString(new Date()));
    setIsAllDay(true);
    setNewTime('10:00');
    setNewTag('');
    setSubtasksList([]);
    setIsAddOpen(true);
  };

  const openEditModal = (task, e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;

    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewDate(task.date);
    if (task.time === 'All day') {
      setIsAllDay(true);
      setNewTime('10:00');
    } else {
      setIsAllDay(false);
      setNewTime(task.time);
    }
    setNewTag(task.tag || '');
    setSubtasksList(task.subtasks ? [...task.subtasks] : []);
    setIsAddOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const formattedTime = isAllDay ? 'All day' : newTime;

    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                title: newTitle.trim(),
                date: newDate,
                time: formattedTime,
                tag: newTag.trim(),
                subtasks: subtasksList,
              }
            : t
        )
      );
    } else {
      const newTask = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        date: newDate,
        time: formattedTime,
        tag: newTag.trim(),
        subtasks: subtasksList,
        completed: false,
        completedAt: null,
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setIsAddOpen(false);
  };

  // 1. CHECKLIST TASK -> PINDAH KE RIWAYAT
  const handleToggleComplete = (id) => {
    const taskToComplete = tasks.find((t) => t.id === id);
    if (!taskToComplete) return;

    const completedTask = {
      ...taskToComplete,
      completed: true,
      completedAt: new Date().toISOString(),
      historyType: 'completed', // Tanda bahwa task diselesaikan
    };

    // Tambah ke riwayat & hapus dari daftar aktif
    setHistoryTasks((prev) => [completedTask, ...prev]);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // 2. HAPUS TASK -> PINDAH KE RIWAYAT
  const handleDeleteTask = (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    const deletedTask = {
      ...taskToDelete,
      deletedAt: new Date().toISOString(),
      historyType: 'deleted', // Tanda bahwa task dihapus
    };

    // Tambah ke riwayat & hapus dari daftar aktif
    setHistoryTasks((prev) => [deletedTask, ...prev]);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Hapus Permanen dari Modal Riwayat
  const handlePermanentDeleteHistory = (id) => {
    setHistoryTasks((prev) => prev.filter((item) => item.id !== id));
  };

  // Pulihkan Task Kembali ke Daftar Utama
  const handleRestoreTask = (historyItem) => {
    const restoredTask = {
      ...historyItem,
      completed: false,
      completedAt: null,
      deletedAt: null,
    };
    delete restoredTask.historyType;

    setTasks((prev) => [restoredTask, ...prev]);
    setHistoryTasks((prev) => prev.filter((item) => item.id !== historyItem.id));
  };

  // Sub-task Toggle di Card
  const handleToggleSubtask = (taskId, subId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const sortedActiveTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));

  const groupedTasks = sortedActiveTasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const formatDateHeader = (dateStr) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all select-none ${
      darkMode ? 'bg-[#0b0c0e] border-gray-800/80 text-gray-200' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
    }`}>
      {/* --- TOP BAR --- */}
      <div className="flex items-center gap-3 mb-6">
        <div
          onClick={openAddModal}
          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
            darkMode
              ? 'bg-[#16181d] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
              : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Plus className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium">Add a new task...</span>
        </div>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className={`p-3 rounded-xl border transition-colors relative ${
            darkMode
              ? 'bg-[#16181d] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
          }`}
          title="Riwayat Task"
        >
          <History className="w-5 h-5" />
          {historyTasks.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      {/* --- LIST TASK AKTIF --- */}
      <div className="space-y-6">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Belum ada task aktif. Klik "+ Add a new task..." untuk membuat!
          </div>
        ) : (
          Object.keys(groupedTasks).map((dateKey) => {
            const diffDays = getDaysDifference(dateKey);
            const isToday = diffDays === 0;

            return (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-semibold tracking-wide ${
                    isToday
                      ? 'text-blue-400 font-bold underline underline-offset-4 decoration-2'
                      : 'text-gray-400'
                  }`}>
                    {formatDateHeader(dateKey)} {isToday && '(Hari Ini)'}
                  </h3>
                </div>

                <div className="space-y-3">
                  {groupedTasks[dateKey].map((task) => {
                    const taskDiff = getDaysDifference(task.date);
                    const isOverdue = taskDiff < 0;
                    const isNearDeadline = taskDiff > 0 && taskDiff <= 2;
                    const isTaskToday = taskDiff === 0;

                    let textColor = darkMode ? 'text-gray-200' : 'text-gray-800';
                    if (isOverdue) {
                      textColor = 'text-red-500 font-medium';
                    }

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => openEditModal(task, e)}
                        className={`group relative flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isOverdue
                            ? 'bg-red-950/10 border-red-900/30'
                            : isTaskToday
                            ? 'bg-blue-600/15 border-blue-500/50 shadow-sm shadow-blue-500/10'
                            : isNearDeadline
                            ? 'bg-amber-950/10 border-amber-800/40'
                            : darkMode
                            ? 'bg-[#121419]/60 border-gray-800/60 hover:border-gray-700'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                        title="Klik untuk edit task"
                      >
                        {/* Checkbox (Klik untuk selesaikan & pindahkan ke riwayat) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(task.id);
                          }}
                          className="mt-0.5 text-gray-400 hover:text-blue-500 transition-colors shrink-0"
                          title="Tandai Selesai"
                        >
                          <Circle className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1 text-[11px] font-semibold">
                            <span className={isOverdue ? 'text-red-400' : isTaskToday ? 'text-blue-400 font-bold' : 'text-amber-500'}>
                              {task.time}
                            </span>

                            {task.tag && (
                              <span className="px-1.5 py-0.5 rounded bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-400 uppercase tracking-wider text-[10px]">
                                {task.tag}
                              </span>
                            )}

                            {isOverdue && (
                              <div className="flex items-center gap-1.5 text-red-500 font-bold">
                                <span className="bg-red-500/20 px-1.5 py-0.5 rounded text-[10px] uppercase">
                                  OVERDUE
                                </span>
                                <span>Overdue by {Math.abs(taskDiff)} days</span>
                              </div>
                            )}

                            {isTaskToday && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold text-[10px]">
                                Hari Ini!
                              </span>
                            )}

                            {isNearDeadline && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-[10px]">
                                {taskDiff} hari lagi
                              </span>
                            )}
                          </div>

                          <p className={`text-sm leading-snug break-words ${textColor}`}>
                            {task.title}
                          </p>

                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2.5 space-y-1.5 pl-2 border-l-2 border-gray-800">
                              {task.subtasks.map((sub) => (
                                <div key={sub.id} className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={sub.completed}
                                    onChange={() => handleToggleSubtask(task.id, sub.id)}
                                    className="rounded accent-blue-600 cursor-pointer"
                                  />
                                  <span className={sub.completed ? 'line-through text-gray-500' : 'text-gray-400'}>
                                    {sub.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Tombol Hapus (Pindahkan ke riwayat) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Hapus ke Riwayat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL TAMBAH / EDIT TASK --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#12141a] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingTaskId ? 'Edit Task' : 'Tambah Task Baru'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Judul Task</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Buy movie tickets for friday!"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#1a1d26] border-gray-800 focus:border-blue-500' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Tanggal Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      darkMode ? 'bg-[#1a1d26] border-gray-800 focus:border-blue-500' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Waktu / Jam</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAllDay(!isAllDay)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isAllDay
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : darkMode ? 'bg-[#1a1d26] border-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}
                      title="Toggle All Day"
                    >
                      All Day
                    </button>
                    {!isAllDay && (
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className={`w-full px-2 py-2 rounded-xl border text-xs outline-none ${
                          darkMode ? 'bg-[#1a1d26] border-gray-800 focus:border-blue-500' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Tag / Kategori (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: @MATH 301"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#1a1d26] border-gray-800 focus:border-blue-500' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              {/* Sub-task */}
              <div className="pt-2 border-t border-gray-800">
                <label className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  Task Mini / Sub-task (Opsional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Tambah sub-tugas kecil..."
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      darkMode ? 'bg-[#1a1d26] border-gray-800 focus:border-blue-500' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtaskItem}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Tambah
                  </button>
                </div>

                {subtasksList.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-[#161821]/50 border border-gray-800">
                    {subtasksList.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between text-xs text-gray-300">
                        <span>• {sub.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtaskItem(sub.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800/50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500"
                >
                  {editingTaskId ? 'Simpan Perubahan' : 'Simpan Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL RIWAYAT TASK (SELESAI & DIHAPUS) --- */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${
            darkMode ? 'bg-[#12141a] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">Riwayat Task</h3>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {historyTasks.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-6">Belum ada riwayat task yang dicentang atau dihapus.</p>
              ) : (
                historyTasks.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      darkMode ? 'bg-[#1a1d26] border-gray-800/80' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.historyType === 'completed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                            SELESAI
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            DIHAPUS
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">
                          {new Date(item.completedAt || item.deletedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${item.historyType === 'completed' ? 'line-through text-gray-400' : 'text-gray-300'}`}>
                        {item.title}
                      </p>
                    </div>

                    {/* Aksional: Pulihkan atau Hapus Permanen */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRestoreTask(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        title="Pulihkan Task ke Daftar Aktif"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteHistory(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Hapus Permanen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}