import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1622329357373 implements MigrationInterface {
	name = "Migration1622329357373";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "preference" ADD "courseStaffId" character varying NOT NULL`);
		await queryRunner.query(`ALTER TABLE "user_settings" ADD "userId" character varying NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "term"."weekNames" IS NULL`);
		await queryRunner.query(`ALTER TABLE "term" ALTER COLUMN "weekNames" SET DEFAULT array[]::varchar[]`);
		await queryRunner.query(`ALTER TABLE "session_allocation" DROP CONSTRAINT "FK_4229fc0a3545c3afd0bfb0bb7e4"`);
		await queryRunner.query(`ALTER TABLE "session_allocation" DROP CONSTRAINT "FK_4ad45c42f963d66b7d38b6e9fe8"`);
		await queryRunner.query(`ALTER TABLE "session_allocation" DROP CONSTRAINT "UQ_48fa99dd8231087c41a285f606f"`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ALTER COLUMN "sessionId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "session_allocation"."sessionId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ALTER COLUMN "userId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "session_allocation"."userId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_0a9f568475b4a5401669c61333f"`);
		await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_e8100751be1076656606ae045e3"`);
		await queryRunner.query(`ALTER TABLE "offer" ALTER COLUMN "requestId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "offer"."requestId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "offer" ALTER COLUMN "userId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "offer"."userId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "staff_request" DROP CONSTRAINT "FK_f8d9da2b83b977dcc23b6c2fc60"`);
		await queryRunner.query(`ALTER TABLE "staff_request" DROP CONSTRAINT "FK_0f5d437fc98264cfb98dafdf080"`);
		await queryRunner.query(`ALTER TABLE "staff_request" DROP CONSTRAINT "UQ_3aa706a41308e3fd7107bf5d078"`);
		await queryRunner.query(`ALTER TABLE "staff_request" ALTER COLUMN "requesterId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "staff_request"."requesterId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "staff_request" ALTER COLUMN "sessionId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "staff_request"."sessionId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_e18308596f3076e9de1d80c6f51"`);
		await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "UQ_3d57e44540eb64af0e24d4a02ab"`);
		await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "sessionStreamId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "session"."sessionStreamId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "session_stream" DROP CONSTRAINT "FK_66028ae4744099f055d7763a503"`);
		await queryRunner.query(`ALTER TABLE "session_stream" ALTER COLUMN "timetableId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "session_stream"."timetableId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" DROP CONSTRAINT "FK_b3d5528826d766b691e1132107f"`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" DROP CONSTRAINT "FK_bc7afec02062c5cedc6d14bd6af"`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" DROP CONSTRAINT "UQ_8b449413d5d44c30ffff74aa0f0"`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ALTER COLUMN "sessionStreamId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "stream_allocation"."sessionStreamId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ALTER COLUMN "userId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "stream_allocation"."userId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "timeslot" DROP CONSTRAINT "FK_47d06adf246fcfea1d318423ee3"`);
		await queryRunner.query(`ALTER TABLE "timeslot" ALTER COLUMN "userId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "timeslot"."userId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "course_staff" DROP CONSTRAINT "FK_2f8044368c327e2ad804dc1fe56"`);
		await queryRunner.query(`ALTER TABLE "course_staff" DROP CONSTRAINT "FK_d3dfdd3bab57eedfcf1e45bc72d"`);
		await queryRunner.query(`ALTER TABLE "course_staff" DROP CONSTRAINT "UQ_f33c09ecdf4a0ee5a8a27ac971d"`);
		await queryRunner.query(`ALTER TABLE "course_staff" ALTER COLUMN "timetableId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "course_staff"."timetableId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "course_staff" ALTER COLUMN "preferenceId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "course_staff"."preferenceId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "timetable" DROP CONSTRAINT "FK_9cc6b2c53c23571cad8390666f4"`);
		await queryRunner.query(`ALTER TABLE "timetable" DROP CONSTRAINT "FK_531f53d06003b9e25ed9f2f0cd3"`);
		await queryRunner.query(`ALTER TABLE "timetable" DROP CONSTRAINT "UQ_091ca503e51c3de094972d48cb2"`);
		await queryRunner.query(`ALTER TABLE "timetable" ALTER COLUMN "courseId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "timetable"."courseId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "timetable" ALTER COLUMN "termId" SET NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "timetable"."termId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ADD CONSTRAINT "UQ_48fa99dd8231087c41a285f606f" UNIQUE ("sessionId", "userId")`);
		await queryRunner.query(`ALTER TABLE "staff_request" ADD CONSTRAINT "UQ_3aa706a41308e3fd7107bf5d078" UNIQUE ("requesterId", "sessionId")`);
		await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "UQ_3d57e44540eb64af0e24d4a02ab" UNIQUE ("sessionStreamId", "week")`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ADD CONSTRAINT "UQ_8b449413d5d44c30ffff74aa0f0" UNIQUE ("sessionStreamId", "userId")`);
		await queryRunner.query(`ALTER TABLE "course_staff" ADD CONSTRAINT "UQ_f33c09ecdf4a0ee5a8a27ac971d" UNIQUE ("timetableId", "userId")`);
		await queryRunner.query(`ALTER TABLE "timetable" ADD CONSTRAINT "UQ_091ca503e51c3de094972d48cb2" UNIQUE ("courseId", "termId")`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ADD CONSTRAINT "FK_4229fc0a3545c3afd0bfb0bb7e4" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ADD CONSTRAINT "FK_4ad45c42f963d66b7d38b6e9fe8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_0a9f568475b4a5401669c61333f" FOREIGN KEY ("requestId") REFERENCES "staff_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_e8100751be1076656606ae045e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "staff_request" ADD CONSTRAINT "FK_f8d9da2b83b977dcc23b6c2fc60" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "staff_request" ADD CONSTRAINT "FK_0f5d437fc98264cfb98dafdf080" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_e18308596f3076e9de1d80c6f51" FOREIGN KEY ("sessionStreamId") REFERENCES "session_stream"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "session_stream" ADD CONSTRAINT "FK_66028ae4744099f055d7763a503" FOREIGN KEY ("timetableId") REFERENCES "timetable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ADD CONSTRAINT "FK_b3d5528826d766b691e1132107f" FOREIGN KEY ("sessionStreamId") REFERENCES "session_stream"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ADD CONSTRAINT "FK_bc7afec02062c5cedc6d14bd6af" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "timeslot" ADD CONSTRAINT "FK_47d06adf246fcfea1d318423ee3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "course_staff" ADD CONSTRAINT "FK_2f8044368c327e2ad804dc1fe56" FOREIGN KEY ("timetableId") REFERENCES "timetable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "course_staff" ADD CONSTRAINT "FK_d3dfdd3bab57eedfcf1e45bc72d" FOREIGN KEY ("preferenceId") REFERENCES "preference"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "timetable" ADD CONSTRAINT "FK_9cc6b2c53c23571cad8390666f4" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "timetable" ADD CONSTRAINT "FK_531f53d06003b9e25ed9f2f0cd3" FOREIGN KEY ("termId") REFERENCES "term"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "timetable" DROP CONSTRAINT "FK_531f53d06003b9e25ed9f2f0cd3"`);
		await queryRunner.query(`ALTER TABLE "timetable" DROP CONSTRAINT "FK_9cc6b2c53c23571cad8390666f4"`);
		await queryRunner.query(`ALTER TABLE "course_staff" DROP CONSTRAINT "FK_d3dfdd3bab57eedfcf1e45bc72d"`);
		await queryRunner.query(`ALTER TABLE "course_staff" DROP CONSTRAINT "FK_2f8044368c327e2ad804dc1fe56"`);
		await queryRunner.query(`ALTER TABLE "timeslot" DROP CONSTRAINT "FK_47d06adf246fcfea1d318423ee3"`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" DROP CONSTRAINT "FK_bc7afec02062c5cedc6d14bd6af"`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" DROP CONSTRAINT "FK_b3d5528826d766b691e1132107f"`);
		await queryRunner.query(`ALTER TABLE "session_stream" DROP CONSTRAINT "FK_66028ae4744099f055d7763a503"`);
		await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_e18308596f3076e9de1d80c6f51"`);
		await queryRunner.query(`ALTER TABLE "staff_request" DROP CONSTRAINT "FK_0f5d437fc98264cfb98dafdf080"`);
		await queryRunner.query(`ALTER TABLE "staff_request" DROP CONSTRAINT "FK_f8d9da2b83b977dcc23b6c2fc60"`);
		await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_e8100751be1076656606ae045e3"`);
		await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_0a9f568475b4a5401669c61333f"`);
		await queryRunner.query(`ALTER TABLE "session_allocation" DROP CONSTRAINT "FK_4ad45c42f963d66b7d38b6e9fe8"`);
		await queryRunner.query(`ALTER TABLE "session_allocation" DROP CONSTRAINT "FK_4229fc0a3545c3afd0bfb0bb7e4"`);
		await queryRunner.query(`ALTER TABLE "timetable" DROP CONSTRAINT "UQ_091ca503e51c3de094972d48cb2"`);
		await queryRunner.query(`ALTER TABLE "course_staff" DROP CONSTRAINT "UQ_f33c09ecdf4a0ee5a8a27ac971d"`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" DROP CONSTRAINT "UQ_8b449413d5d44c30ffff74aa0f0"`);
		await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "UQ_3d57e44540eb64af0e24d4a02ab"`);
		await queryRunner.query(`ALTER TABLE "staff_request" DROP CONSTRAINT "UQ_3aa706a41308e3fd7107bf5d078"`);
		await queryRunner.query(`ALTER TABLE "session_allocation" DROP CONSTRAINT "UQ_48fa99dd8231087c41a285f606f"`);
		await queryRunner.query(`COMMENT ON COLUMN "timetable"."termId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "timetable" ALTER COLUMN "termId" DROP NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "timetable"."courseId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "timetable" ALTER COLUMN "courseId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "timetable" ADD CONSTRAINT "UQ_091ca503e51c3de094972d48cb2" UNIQUE ("courseId", "termId")`);
		await queryRunner.query(`ALTER TABLE "timetable" ADD CONSTRAINT "FK_531f53d06003b9e25ed9f2f0cd3" FOREIGN KEY ("termId") REFERENCES "term"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "timetable" ADD CONSTRAINT "FK_9cc6b2c53c23571cad8390666f4" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "course_staff"."preferenceId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "course_staff" ALTER COLUMN "preferenceId" DROP NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "course_staff"."timetableId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "course_staff" ALTER COLUMN "timetableId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "course_staff" ADD CONSTRAINT "UQ_f33c09ecdf4a0ee5a8a27ac971d" UNIQUE ("userId", "timetableId")`);
		await queryRunner.query(`ALTER TABLE "course_staff" ADD CONSTRAINT "FK_d3dfdd3bab57eedfcf1e45bc72d" FOREIGN KEY ("preferenceId") REFERENCES "preference"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "course_staff" ADD CONSTRAINT "FK_2f8044368c327e2ad804dc1fe56" FOREIGN KEY ("timetableId") REFERENCES "timetable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "timeslot"."userId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "timeslot" ALTER COLUMN "userId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "timeslot" ADD CONSTRAINT "FK_47d06adf246fcfea1d318423ee3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "stream_allocation"."userId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ALTER COLUMN "userId" DROP NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "stream_allocation"."sessionStreamId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ALTER COLUMN "sessionStreamId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ADD CONSTRAINT "UQ_8b449413d5d44c30ffff74aa0f0" UNIQUE ("sessionStreamId", "userId")`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ADD CONSTRAINT "FK_bc7afec02062c5cedc6d14bd6af" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "stream_allocation" ADD CONSTRAINT "FK_b3d5528826d766b691e1132107f" FOREIGN KEY ("sessionStreamId") REFERENCES "session_stream"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "session_stream"."timetableId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "session_stream" ALTER COLUMN "timetableId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "session_stream" ADD CONSTRAINT "FK_66028ae4744099f055d7763a503" FOREIGN KEY ("timetableId") REFERENCES "timetable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "session"."sessionStreamId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "sessionStreamId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "UQ_3d57e44540eb64af0e24d4a02ab" UNIQUE ("week", "sessionStreamId")`);
		await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_e18308596f3076e9de1d80c6f51" FOREIGN KEY ("sessionStreamId") REFERENCES "session_stream"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "staff_request"."sessionId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "staff_request" ALTER COLUMN "sessionId" DROP NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "staff_request"."requesterId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "staff_request" ALTER COLUMN "requesterId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "staff_request" ADD CONSTRAINT "UQ_3aa706a41308e3fd7107bf5d078" UNIQUE ("requesterId", "sessionId")`);
		await queryRunner.query(`ALTER TABLE "staff_request" ADD CONSTRAINT "FK_0f5d437fc98264cfb98dafdf080" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "staff_request" ADD CONSTRAINT "FK_f8d9da2b83b977dcc23b6c2fc60" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "offer"."userId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "offer" ALTER COLUMN "userId" DROP NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "offer"."requestId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "offer" ALTER COLUMN "requestId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_e8100751be1076656606ae045e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_0a9f568475b4a5401669c61333f" FOREIGN KEY ("requestId") REFERENCES "staff_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`COMMENT ON COLUMN "session_allocation"."userId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ALTER COLUMN "userId" DROP NOT NULL`);
		await queryRunner.query(`COMMENT ON COLUMN "session_allocation"."sessionId" IS NULL`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ALTER COLUMN "sessionId" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ADD CONSTRAINT "UQ_48fa99dd8231087c41a285f606f" UNIQUE ("sessionId", "userId")`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ADD CONSTRAINT "FK_4ad45c42f963d66b7d38b6e9fe8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "session_allocation" ADD CONSTRAINT "FK_4229fc0a3545c3afd0bfb0bb7e4" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "term" ALTER COLUMN "weekNames" SET DEFAULT ARRAY[]`);
		await queryRunner.query(`COMMENT ON COLUMN "term"."weekNames" IS NULL`);
		await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "userId"`);
		await queryRunner.query(`ALTER TABLE "preference" DROP COLUMN "courseStaffId"`);
	}

}