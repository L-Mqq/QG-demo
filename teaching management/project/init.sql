CREATE DATABASE teaching_system;
USE teaching_system;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    PASSWORD VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
    ROLE ENUM('admin', 'teacher', 'student') NOT NULL COMMENT '角色',
    NAME VARCHAR(50) NOT NULL COMMENT '真实姓名',
    class_id INT NULL COMMENT '所属班级ID（班主任/学生）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

SHOW TABLES FROM teaching_system;

CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '班级ID',
    NAME VARCHAR(100) NOT NULL COMMENT '班级名称',
    teacher_id INT NULL COMMENT '班主任ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

CREATE TABLE scores (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '成绩ID',
    student_id INT NOT NULL COMMENT '学生ID',
    class_id INT NOT NULL COMMENT '班级ID',
    SUBJECT VARCHAR(50) NOT NULL COMMENT '科目',
    score INT NOT NULL COMMENT '分数',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

DESC classes;
INSERT INTO users (username, PASSWORD, ROLE, NAME, class_id) VALUES
('admin', ' 123456', 'admin', '张主任', NULL),
('teacher1', '123456', 'teacher', '李老师', 1),
('teacher2', '123456', 'teacher', '王老师', 2),
('student1', '123456', 'student', '王小明', 1),
('student2', '123456', 'student', '李小萌', 1);

INSERT INTO users (username, PASSWORD, ROLE, NAME, class_id) VALUES
('student3', '123456', 'student', '张小飞', 2),
('student4', '123456', 'student', '陈小丽', 2);

SELECT * FROM users;

INSERT INTO classes (id, NAME, teacher_id) VALUES
(1, '高一(1)班', 1),
(2, '高一(2)班', 2),
(3, '高一(3)班', NULL);

INSERT INTO scores (student_id, class_id, SUBJECT, score) VALUES
-- 高一(1)班 王小明
(4, 1, '数学', 85),
(4, 1, '语文', 78),
(4, 1, '英语', 92),
(4, 1, '物理', 88),
-- 高一(1)班 李小萌
(5, 1, '数学', 92),
(5, 1, '语文', 85),
(5, 1, '英语', 90),
(5, 1, '物理', 86),
-- 高一(2)班 张小飞
(6, 2, '数学', 75),
(6, 2, '语文', 80),
(6, 2, '英语', 70),
(6, 2, '物理', 72),
-- 高一(2)班 陈小丽
(7, 2, '数学', 88),
(7, 2, '语文', 92),
(7, 2, '英语', 85),
(7, 2, '物理', 90);

SELECT * FROM scores;

SELECT * FROM users;

SELECT * FROM classes;

UPDATE classes SET teacher_id = 2 WHERE id = 1;

UPDATE classes SET teacher_id = 3 WHERE id = 2;


UPDATE users SET PASSWORD = '123456' WHERE username = 'admin';





