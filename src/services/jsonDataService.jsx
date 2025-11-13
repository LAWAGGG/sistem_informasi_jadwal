// Import semua file JSON
import schedulesData from '../data/schedules.json';
import programsData from '../data/programs.json';
import levelsData from '../data/levels.json';
import daysData from '../data/days.json';
import usersData from '../data/users.json';
import teachersData from '../data/teachers.json';
import studyTimesData from '../data/study_times.json';
import studyLocationsData from '../data/study_locations.json';
import studyGroupsData from '../data/study_groups.json';

class JsonDataService {
    constructor() {
        this.schedules = schedulesData[2].data;
        this.programs = programsData[2].data;
        this.levels = levelsData[2].data;
        this.days = daysData[2].data;
        this.users = usersData[2].data;
        this.teachers = teachersData[2].data;
        this.studyTimes = studyTimesData[2].data;
        this.studyLocations = studyLocationsData[2].data;
        this.studyGroups = studyGroupsData[2].data;
    }

    // Login simulation
    async login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.users.find(u =>
                    u.username === username && u.password === password
                );

                if (user) {
                    resolve({
                        success: true,
                        token: `fake-jwt-token-${user.id}`,
                        user: {
                            id: user.id,
                            name: user.name,
                            username: user.username,
                            email: user.email
                        }
                    });
                } else {
                    reject({
                        success: false,
                        message: 'Username atau password salah'
                    });
                }
            }, 1000); // Simulate network delay
        });
    }

    // Get schedules dengan relasi
    getSchedules() {
        return this.schedules.map(schedule => {
            const studyGroup = this.studyGroups.find(sg => sg.id === schedule.study_group_id);
            const studyTime = this.studyTimes.find(st => st.id === schedule.study_time_id);
            const teacher = this.teachers.find(t => t.id === schedule.teacher_id);
            const user = teacher ? this.users.find(u => u.id === teacher.user_id) : null;
            const studyLocation = this.studyLocations.find(sl => sl.id === schedule.study_location_id);
            const day = studyTime ? this.days.find(d => d.id === studyTime.day_id) : null;

            return {
                ...schedule,
                study_group: studyGroup,
                study_time: studyTime ? {
                    ...studyTime,
                    day: day
                } : null,
                teacher: teacher ? {
                    ...teacher,
                    user: user
                } : null,
                study_location: studyLocation
            };
        });
    }

    // Get schedules by study group
    getSchedulesByStudyGroup(studyGroupId) {
        return this.getSchedules().filter(schedule =>
            schedule.study_group_id === studyGroupId
        );
    }

    // Get schedules by teacher
    getSchedulesByTeacher(teacherId) {
        console.log("Getting schedules for teacher:", teacherId)
        const schedules = this.getSchedules().filter(schedule => {
            const match = parseInt(schedule.teacher_id) === parseInt(teacherId)
            console.log(`Schedule ${schedule.id}: teacher_id = ${schedule.teacher_id}, match = ${match}`)
            return match
        })
        console.log("Found schedules:", schedules)
        return schedules
    }

    // Get teacher by user id
    getTeacherByUserId(userId) {
        return this.getTeachers().find(teacher =>
            parseInt(teacher.user.id) === parseInt(userId)
        );
    }

    // Get study groups dengan relasi
    getStudyGroups() {
        return this.studyGroups.map(group => {
            const level = this.levels.find(l => l.id === group.level_id);
            const program = this.programs.find(p => p.id === group.program_id);
            const chief = this.teachers.find(t => t.id === group.chief_id);
            const chiefUser = chief ? this.users.find(u => u.id === chief.user_id) : null;

            return {
                ...group,
                level: level,
                program: program,
                chief: chief ? {
                    ...chief,
                    user: chiefUser
                } : null
            };
        });
    }

    // Get teachers dengan user data
    getTeachers() {
        return this.teachers.map(teacher => {
            const user = this.users.find(u => u.id === teacher.user_id);
            return {
                ...teacher,
                user: user
            };
        });
    }

    // Get study times dengan hari
    getStudyTimes() {
        return this.studyTimes.map(time => {
            const day = this.days.find(d => d.id === time.day_id);
            return {
                ...time,
                day: day
            };
        });
    }

    // Get programs
    getPrograms() {
        return this.programs;
    }

    // Get levels
    getLevels() {
        return this.levels;
    }

    // Get days
    getDays() {
        return this.days;
    }

    // Get study locations
    getStudyLocations() {
        return this.studyLocations;
    }
}

export default new JsonDataService();