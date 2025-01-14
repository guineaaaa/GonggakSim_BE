// 입력받은 Body 값
export const userConsentDto = ( body: {
    age: any,
    department: string,
    grade: string,
    category: string,
    employmentStatus: string,
}) => {
    return {
        age: body.age,
        department: body.department,
        grade: body.grade,
        category: body.category,
        employmentStatus: body.employmentStatus,
    };
};