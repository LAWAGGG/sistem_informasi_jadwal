import { useEffect, useState } from "react"
import { getToken, removeToken, getUser } from "../utils/utils"
import { Link, useNavigate } from "react-router-dom"
import Logout from "../assets/Logout"
import jsonDataService from "../services/jsonDataService"

export default function Dashboard() {
    const [name, setName] = useState("")
    const [schedule, setSchedule] = useState([])
    const [teacherData, setTeacherData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const navigate = useNavigate()

    function fetchUser() {
        const user = getUser()
        if (user) {
            setName(user.name)

            // Cari data teacher berdasarkan user id - PERBAIKAN: parse to int
            const teachers = jsonDataService.getTeachers()
            const teacher = teachers.find(t => parseInt(t.user.id) === parseInt(user.id))
            if (teacher) {
                setTeacherData(prev => ({
                    ...prev,
                    teacher_id: teacher.id,
                    nama_guru: user.name
                }))
            }
        } else {
            setName("Guru")
        }
    }

    function fetchSchedule() {
        try {
            const user = getUser()
            if (!user) {
                setErrorMessage("Data user tidak ditemukan")
                setIsLoading(false)
                return
            }

            // Cari teacher berdasarkan user id - PERBAIKAN: parse to int
            const teachers = jsonDataService.getTeachers()
            const teacher = teachers.find(t => parseInt(t.user.id) === parseInt(user.id))

            if (!teacher) {
                setErrorMessage("Data guru tidak ditemukan")
                setIsLoading(false)
                return
            }

            console.log("Teacher:", teacher) // Debug

            // Dapatkan jadwal hari ini untuk teacher ini
            const todaySchedules = getTodaySchedules(teacher.id)

            console.log("Today schedules:", todaySchedules) // Debug

            setSchedule(todaySchedules)
            setTeacherData(prev => ({
                ...prev,
                teacher_id: teacher.id,
                nama_guru: user.name,
                hari: getTodayIndonesian(),
                total_jadwal: todaySchedules.length
            }))
            setIsLoading(false)

        } catch (error) {
            console.error(error)
            setErrorMessage("Gagal memuat jadwal.")
            setIsLoading(false)
        }
    }

    // PERBAIKAN: Fungsi untuk mendapatkan jadwal hari ini
    function getTodaySchedules(teacherId) {
        const allSchedules = jsonDataService.getSchedulesByTeacher(teacherId)
        const today = getTodayIndonesian()

        console.log("All schedules:", allSchedules) // Debug
        console.log("Today:", today) // Debug

        const filteredSchedules = allSchedules.filter(schedule => {
            const dayName = schedule.study_time?.day?.day
            console.log(`Checking schedule ${schedule.id}: ${dayName} vs ${today}`) // Debug
            return dayName === today
        })

        console.log("Filtered schedules:", filteredSchedules) // Debug

        return filteredSchedules.map(schedule => {
            // PERBAIKAN: Pastikan study_group terisi dengan benar
            const studyGroup = jsonDataService.getStudyGroups().find(
                sg => parseInt(sg.id) === parseInt(schedule.study_group_id)
            )

            console.log("Study group for schedule", schedule.id, ":", studyGroup) // Debug

            return {
                schedule_id: schedule.id,
                kelas: getClassName(studyGroup),
                lokasi: schedule.study_location?.name || "Ruang Teori",
                waktu_mengajar: {
                    jam_ke: schedule.study_time?.number || 0,
                    waktu_mulai: schedule.study_time?.start_time || "00:00",
                    waktu_selesai: schedule.study_time?.end_time || "00:00"
                }
            }
        })
    }

    // PERBAIKAN: Fungsi untuk mendapatkan nama kelas
    function getClassName(studyGroup) {
        console.log("getClassName received:", studyGroup) // Debug

        if (!studyGroup) {
            return "Kelas Tidak Diketahui"
        }

        // PERBAIKAN: Pastikan level dan program terisi
        const level = studyGroup.level?.name || ""
        const program = studyGroup.program?.codename || ""
        const number = studyGroup.number ? ` ${studyGroup.number}` : ""

        const className = `${level} ${program}${number}`.trim()
        console.log("Generated class name:", className) // Debug

        return className || "Kelas"
    }

    // PERBAIKAN: Fungsi untuk mendapatkan hari ini
    function getTodayIndonesian() {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
        const today = new Date().getDay()
        return days[today]
    }

    useEffect(() => {
        fetchUser()
        fetchSchedule()
    }, [])

    const today = new Date();
    const dayOfMonth = today.getDate();
    const dayOfWeekNumber = today.getDay();

    const weekdays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayOfWeekString = weekdays[dayOfWeekNumber];

    const formatTime = (timeString) => {
        if (!timeString) return "--:--"
        return timeString.substring(0, 5) // Format: HH:MM
    }

    const sortedSchedule = [...schedule].sort(
        (a, b) => a.waktu_mengajar.jam_ke - b.waktu_mengajar.jam_ke
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">Memuat jadwal...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-4 md:mb-0">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 break-words">
                                    Selamat Datang, <span className="text-green-600">{name}</span>
                                </h1>
                                <div className="text-gray-600 text-sm sm:text-base">
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                        <span>Hari {teacherData.hari ?? dayOfWeekString}</span>
                                        <span className="hidden sm:block">•</span>
                                        <Link
                                            className="hidden sm:block underline text-green-800 hover:text-green-600 transition-colors text-nowrap"
                                            to="/dashboard/all"
                                        >
                                            Semua Jadwal
                                        </Link>
                                        <span className="hidden sm:block">•</span>
                                        <Link
                                            className="hidden sm:block underline text-green-800 hover:text-green-600 transition-colors text-nowrap"
                                            to="/dashboard/major"
                                        >
                                            Per Jurusan
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-4 md:mt-0">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg min-w-[120px]">
                                    <p className="text-xs sm:text-sm text-center opacity-90 whitespace-nowrap">Total Jadwal Hari Ini</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-center">{teacherData.total_jadwal || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Navigation Cards - Mobile Only */}
                    <div className="md:hidden grid grid-cols-2 gap-3 mb-6">
                        <Link
                            to="/dashboard/all"
                            className="bg-white rounded-xl p-4 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200 text-center"
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-800">Semua Jadwal</span>
                        </Link>
                        <Link
                            to="/dashboard/major"
                            className="bg-white rounded-xl p-4 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200 text-center"
                        >
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-800">Per Jurusan</span>
                        </Link>
                    </div>

                    {/* Schedule Section */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 sm:px-6 py-3 sm:py-4">
                            <h2 className="text-lg sm:text-xl font-bold text-white text-center sm:text-left">
                                Jadwal Mengajar Hari Ini
                            </h2>
                        </div>

                        <div className="p-4 sm:p-6">
                            {/* Jika error dari server */}
                            {errorMessage ? (
                                <div className="text-center py-6 sm:py-10">
                                    <svg
                                        className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                                        />
                                    </svg>
                                    <p className="text-gray-600 text-sm sm:text-lg mb-3 sm:mb-4 px-2">{errorMessage}</p>
                                    <button
                                        onClick={fetchSchedule}
                                        className="bg-green-600 text-white px-4 sm:px-5 py-2 rounded-lg shadow hover:bg-green-700 transition text-sm sm:text-base"
                                    >
                                        Coba Muat Ulang
                                    </button>
                                </div>
                            ) : sortedSchedule.length === 0 ? (
                                // Jika tidak ada data tapi tanpa error
                                <div className="text-center py-6 sm:py-10">
                                    <svg
                                        className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p className="text-gray-500 text-sm sm:text-lg px-2">Tidak ada jadwal mengajar hari ini</p>
                                </div>
                            ) : (
                                // Jika ada data jadwal
                                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {sortedSchedule.map((item) => (
                                        <div
                                            key={item.schedule_id}
                                            className="border-2 border-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-all duration-300 hover:border-green-300 bg-gradient-to-br from-white to-green-50"
                                        >
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <div className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                                                    Jam ke-{item.waktu_mengajar.jam_ke}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs sm:text-sm text-gray-500">Waktu</div>
                                                    <div className="font-semibold text-gray-800 text-xs sm:text-sm whitespace-nowrap">
                                                        {formatTime(item.waktu_mengajar.waktu_mulai)} - {formatTime(item.waktu_mengajar.waktu_selesai)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-2 sm:mb-3">
                                                <div className="text-xs sm:text-sm text-gray-500 mb-1">Kelas</div>
                                                <div className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg break-words line-clamp-2">
                                                    {item.kelas}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <svg
                                                        className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    <span className="text-xs sm:text-sm text-gray-600 break-words">{item.lokasi}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 sm:mt-4">
                                                <div className="w-full bg-gray-200 rounded-full h-1">
                                                    <div
                                                        className="bg-green-500 h-1 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${(item.waktu_mengajar.jam_ke / 10) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Section - Hidden on mobile for space optimization */}
                    <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Jam Pertama</h3>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                                {sortedSchedule.length > 0 ? formatTime(sortedSchedule[0].waktu_mengajar.waktu_mulai) : '-'}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Total Jadwal</h3>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{teacherData.total_jadwal ?? "-"}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Jam Terakhir</h3>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                                {sortedSchedule.length > 0 ? formatTime(sortedSchedule[sortedSchedule.length - 1].waktu_mengajar.waktu_selesai) : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Logout />
        </>
    )
}