import { useEffect, useState } from "react"
import { getToken, removeToken, getUser } from "../utils/utils"
import { Link, useNavigate } from "react-router-dom"
import jsonDataService from "../services/jsonDataService"

export default function AllSchedule() {
    const [scheduleData, setScheduleData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDay, setSelectedDay] = useState("Semua")
    const navigate = useNavigate()

    function fetchAllSchedule() {
        try {
            const user = getUser()
            if (!user) {
                navigate('/', { replace: true })
                return
            }

            // Cari teacher berdasarkan user id
            const teachers = jsonDataService.getTeachers()
            const teacher = teachers.find(t => parseInt(t.user.id) === parseInt(user.id))
            
            if (!teacher) {
                console.error("Teacher not found")
                setIsLoading(false)
                return
            }

            // Dapatkan semua jadwal untuk teacher ini
            const allSchedules = jsonDataService.getSchedulesByTeacher(teacher.id)
            
            // Format data sesuai dengan struktur yang diharapkan
            const formattedSchedules = allSchedules.map(schedule => {
                const studyGroup = jsonDataService.getStudyGroups().find(
                    sg => parseInt(sg.id) === parseInt(schedule.study_group_id)
                )
                
                return {
                    schedule_id: schedule.id,
                    kelas: getClassName(studyGroup),
                    lokasi: schedule.study_location?.name || "Ruang Teori",
                    waktu_mengajar: {
                        jam_ke: schedule.study_time?.number || 0,
                        waktu_mulai: schedule.study_time?.start_time || "00:00",
                        waktu_selesai: schedule.study_time?.end_time || "00:00",
                        hari: schedule.study_time?.day?.day || "Tidak Diketahui"
                    }
                }
            })

            const data = {
                nama_guru: user.name,
                total_jadwal: formattedSchedules.length,
                jadwal: formattedSchedules
            }

            console.log("All schedule data:", data)
            setScheduleData(data)
            setIsLoading(false)
            
        } catch (error) {
            console.error("Error fetching all schedules:", error)
            setIsLoading(false)
        }
    }

    // Fungsi untuk mendapatkan nama kelas
    function getClassName(studyGroup) {
        if (!studyGroup) return "Kelas Tidak Diketahui"
        
        const level = studyGroup.level?.name || ""
        const program = studyGroup.program?.codename || ""
        const number = studyGroup.number ? ` ${studyGroup.number}` : ""
        
        return `${level} ${program}${number}`.trim()
    }

    const groupByDay = (schedules) => {
        const grouped = {
            "Senin": [],
            "Selasa": [],
            "Rabu": [],
            "Kamis": [],
            "Jumat": [],
        }

        schedules?.forEach(schedule => {
            const hari = schedule.waktu_mengajar.hari
            if (grouped[hari]) {
                grouped[hari].push(schedule)
            }
        })

        Object.keys(grouped).forEach(day => {
            grouped[day].sort((a, b) => a.waktu_mengajar.jam_ke - b.waktu_mengajar.jam_ke)
        })

        return grouped
    }

    useEffect(() => {
        fetchAllSchedule()
    }, [])

    const groupedSchedule = groupByDay(scheduleData.jadwal)
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]

    const filteredSchedule = selectedDay === "Semua"
        ? scheduleData.jadwal
        : groupedSchedule[selectedDay] || []

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat jadwal...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-4 lg:mb-0">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Jadwal Mengajar Mingguan
                            </h1>
                            <p className="text-gray-600">
                                {scheduleData.nama_guru} • <Link className="underline text-green-800 hover:text-green-600" to='/dashboard'>Kembali ke Dashboard</Link>
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 lg:flex lg:space-x-4">
                            <div className="bg-green-500 text-white px-4 py-3 rounded-xl text-center">
                                <p className="text-sm opacity-90">Total Jadwal</p>
                                <p className="text-2xl font-bold">{scheduleData.total_jadwal || 0}</p>
                            </div>
                            <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl text-center">
                                <p className="text-sm opacity-90">Hari Aktif</p>
                                <p className="text-2xl font-bold">
                                    {Object.keys(groupedSchedule).filter(day => groupedSchedule[day]?.length > 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Berdasarkan Hari</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedDay("Semua")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                selectedDay === "Semua"
                                    ? "bg-green-500 text-white shadow-lg transform -translate-y-0.5"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Semua Hari
                        </button>
                        {days.map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    selectedDay === day
                                        ? "bg-green-500 text-white shadow-lg transform -translate-y-0.5"
                                        : groupedSchedule[day]?.length > 0
                                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                                disabled={!groupedSchedule[day] || groupedSchedule[day].length === 0}
                            >
                                {day} {groupedSchedule[day]?.length > 0 && `(${groupedSchedule[day].length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Schedule Content */}
                {selectedDay === "Semua" ? (
                    <div className="space-y-6">
                        {days.map(day => (
                            groupedSchedule[day]?.length > 0 && (
                                <div key={day} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                                        <h2 className="text-xl font-bold text-white flex items-center">
                                            <span className="mr-3">{day}</span>
                                            <span className="bg-white bg-opacity-20 px-3 text-black py-1 rounded-full text-sm">
                                                {groupedSchedule[day].length} Jadwal
                                            </span>
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {groupedSchedule[day].map((item) => (
                                                <div
                                                    key={item.schedule_id}
                                                    className="border-2 border-green-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-green-300 bg-gradient-to-br from-white to-green-50"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                            Jam Ke-{item.waktu_mengajar.jam_ke}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm text-gray-500">Waktu</div>
                                                            <div className="font-semibold text-gray-800">
                                                                {item.waktu_mengajar.waktu_mulai} - {item.waktu_mengajar.waktu_selesai}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="text-sm text-gray-500 mb-1">Kelas</div>
                                                        <div className="font-bold text-lg text-gray-800">
                                                            {item.kelas}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span className="text-sm text-gray-600">{item.lokasi}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    // Tampilan hari tertentu
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center justify-between">
                                <span>{selectedDay}</span>
                                <span className="bg-white text-black bg-opacity-20 px-3 py-1 rounded-full text-sm">
                                    {filteredSchedule.length} Jadwal
                                </span>
                            </h2>
                        </div>
                        <div className="p-6">
                            {filteredSchedule.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg mb-2">Tidak ada jadwal mengajar</p>
                                    <p className="text-gray-400">Tidak ada jadwal mengajar pada hari {selectedDay}</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredSchedule.map((item) => (
                                        <div
                                            key={item.schedule_id}
                                            className="border-2 border-green-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-green-300 bg-gradient-to-br from-white to-green-50"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                    Jam Ke-{item.waktu_mengajar.jam_ke}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Waktu</div>
                                                    <div className="font-semibold text-gray-800">
                                                        {item.waktu_mengajar.waktu_mulai} - {item.waktu_mengajar.waktu_selesai}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <div className="text-sm text-gray-500 mb-1">Kelas</div>
                                                <div className="font-bold text-lg text-gray-800">
                                                    {item.kelas}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">{item.lokasi}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}