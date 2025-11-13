import { useEffect, useState } from "react"
import { getToken, removeToken, getUser } from "../utils/utils"
import { useParams, useNavigate, Link } from "react-router-dom"
import jsonDataService from "../services/jsonDataService"

export default function ScheduleMajor() {
    const [scheduleData, setScheduleData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const { MajorID } = useParams()
    const navigate = useNavigate()

    // Get study groups from JSON data
    const getMajorsFromStudyGroups = () => {
        const studyGroups = jsonDataService.getStudyGroups()
        return studyGroups.map(group => {
            const level = group.level?.name || ""
            const program = group.program?.codename || ""
            const number = group.number ? ` ${group.number}` : ""
            
            return {
                id: parseInt(group.id),
                name: `${level} ${program}${number}`.trim(),
                codename: program,
                study_group_id: parseInt(group.id)
            }
        })
    }

    const majors = getMajorsFromStudyGroups()

    // Fetch schedule for specific major
    function fetchMajorSchedule() {
        try {
            setIsLoading(true)
            setError("")

            if (!MajorID) {
                setScheduleData({})
                setIsLoading(false)
                return
            }

            const user = getUser()
            if (!user) {
                navigate('/', { replace: true })
                return
            }

            // Cari teacher berdasarkan user id
            const teachers = jsonDataService.getTeachers()
            const teacher = teachers.find(t => parseInt(t.user.id) === parseInt(user.id))
            
            if (!teacher) {
                setError("Data guru tidak ditemukan")
                setIsLoading(false)
                return
            }

            // Dapatkan semua jadwal untuk teacher ini
            const allSchedules = jsonDataService.getSchedulesByTeacher(teacher.id)
            
            // Filter jadwal berdasarkan study_group_id (MajorID)
            const majorSchedules = allSchedules.filter(schedule => 
                parseInt(schedule.study_group_id) === parseInt(MajorID)
            )

            // Format data sesuai dengan struktur yang diharapkan
            const formattedSchedules = majorSchedules.map(schedule => {
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

            const selectedMajor = majors.find(major => major.id === parseInt(MajorID))

            const data = {
                nama_guru: user.name,
                kelas: selectedMajor?.name || "Kelas Tidak Diketahui",
                total_jadwal: formattedSchedules.length,
                jadwal: formattedSchedules
            }

            console.log("Major schedule data:", data)
            setScheduleData(data)
            setIsLoading(false)
            
        } catch (error) {
            console.error("Error fetching major schedule:", error)
            setError("Gagal memuat jadwal jurusan. Silakan coba lagi.")
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

    useEffect(() => {
        if (MajorID) {
            fetchMajorSchedule()
        } else {
            setScheduleData({})
            setIsLoading(false)
        }
    }, [MajorID])

    // Group schedule by hari
    const groupByDay = (schedules) => {
        const grouped = {
            "Senin": [],
            "Selasa": [],
            "Rabu": [],
            "Kamis": [],
            "Jumat": [],
            "Sabtu": [],
            "Minggu": []
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

    const groupedSchedule = groupByDay(scheduleData.jadwal)
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    const selectedMajor = majors.find(major => major.id == MajorID)

    if (error && !MajorID) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak Ada Jadwal</h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200"
                            >
                                Kembali ke Dashboard
                            </button>
                        </div>
                    </div>
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
                                Jadwal Mengajar per Kelas
                            </h1>
                            <p className="text-gray-600">
                                Pilih kelas untuk melihat jadwal mengajar • <Link className="underline text-green-800 hover:text-green-600" to='/dashboard'>Kembali ke Dashboard</Link>
                            </p>
                        </div>
                        {scheduleData.total_jadwal > 0 && (
                            <div className="grid grid-cols-2 gap-4 lg:flex lg:space-x-4">
                                <div className="bg-green-500 text-white px-4 py-3 rounded-xl text-center">
                                    <p className="text-sm opacity-90">Total Jadwal</p>
                                    <p className="text-2xl font-bold">{scheduleData.total_jadwal}</p>
                                </div>
                                <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl text-center">
                                    <p className="text-sm opacity-90">Hari Aktif</p>
                                    <p className="text-2xl font-bold">
                                        {Object.keys(groupedSchedule).filter(day => groupedSchedule[day]?.length > 0).length}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Majors List Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Kelas</h2>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {majors.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Tidak ada kelas</p>
                                ) : (
                                    majors.map((major) => (
                                        <Link
                                            key={major.id}
                                            to={`/dashboard/major/${major.id}`}
                                            className={`block p-3 rounded-lg border-2 transition-all duration-200 ${
                                                MajorID == major.id
                                                    ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                                                    : "border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium truncate">{major.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{major.codename}</div>
                                                </div>
                                                {MajorID == major.id && (
                                                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Schedule Content */}
                    <div className="lg:col-span-3">
                        {!MajorID ? (
                            // No major selected state
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Pilih Kelas</h3>
                                <p className="text-gray-600">
                                    Silakan pilih kelas dari daftar di samping untuk melihat jadwal mengajar
                                </p>
                            </div>
                        ) : isLoading ? (
                            // Loading state
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat jadwal...</p>
                            </div>
                        ) : error ? (
                            // Error state
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak Ada Jadwal</h3>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <button
                                    onClick={fetchMajorSchedule}
                                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        ) : scheduleData.jadwal?.length === 0 ? (
                            // Empty schedule state
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak Ada Jadwal</h3>
                                <p className="text-gray-600 mb-6">
                                    Tidak ada jadwal mengajar untuk {selectedMajor?.name}
                                </p>
                            </div>
                        ) : (
                            // Schedule content
                            <>
                                {/* Selected Major Info */}
                                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                                {scheduleData.kelas || selectedMajor?.name}
                                            </h2>
                                            <p className="text-gray-600">
                                                {scheduleData.nama_guru} • {scheduleData.total_jadwal} jadwal mengajar
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule by Day */}
                                <div className="space-y-6">
                                    {days.map(day => (
                                        groupedSchedule[day]?.length > 0 && (
                                            <div key={day} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                                                    <h3 className="text-xl font-bold text-white flex items-center">
                                                        <span className="mr-3">{day}</span>
                                                        <span className="bg-white bg-opacity-20 text-black px-3 py-1 rounded-full text-sm">
                                                            {groupedSchedule[day].length} Jadwal
                                                        </span>
                                                    </h3>
                                                </div>
                                                <div className="p-6">
                                                    <div className="grid gap-4 md:grid-cols-2">
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

                                                                <div className="mb-4">
                                                                    <div className="text-sm text-gray-500 mb-1">Lokasi Mengajar</div>
                                                                    <div className="flex items-center">
                                                                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        </svg>
                                                                        <span className="font-medium text-gray-800">{item.lokasi}</span>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}