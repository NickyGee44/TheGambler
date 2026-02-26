CREATE TABLE "bets" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"opponent_id" integer,
	"tournament_year" integer NOT NULL,
	"description" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"type" text DEFAULT 'custom',
	"round" integer,
	"hole" integer,
	"status" text DEFAULT 'open',
	"creator_payment_intent_id" text,
	"opponent_payment_intent_id" text,
	"winner_id" integer,
	"settled_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boozelympics_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"supplies" text NOT NULL,
	"players_needed" varchar(20) NOT NULL,
	"time_estimate" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boozelympics_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"player1_id" integer,
	"player2_id" integer,
	"team1_id" integer,
	"team2_id" integer,
	"winner_id" integer,
	"winner_team_id" integer,
	"points" integer DEFAULT 0,
	"bonus_points" integer DEFAULT 0,
	"mvp_id" integer,
	"match_data" jsonb DEFAULT '{}',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"tagged_user_ids" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "golf_relay_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"time_ms" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guest_application_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"voter_user_id" integer NOT NULL,
	"vote" text NOT NULL,
	"voted_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guest_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicant_user_id" integer NOT NULL,
	"guest_name" text NOT NULL,
	"guest_relationship" text,
	"reason" text,
	"status" text DEFAULT 'pending',
	"tournament_year" integer NOT NULL,
	"votes_yes" integer DEFAULT 0,
	"votes_no" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hole_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"round" integer NOT NULL,
	"hole" integer NOT NULL,
	"strokes" integer NOT NULL,
	"par" integer DEFAULT 4 NOT NULL,
	"handicap" integer DEFAULT 0 NOT NULL,
	"net_score" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"fairway_in_regulation" boolean,
	"green_in_regulation" boolean DEFAULT false NOT NULL,
	"drive_direction" varchar(10),
	"putts" integer DEFAULT 0 NOT NULL,
	"penalties" integer DEFAULT 0 NOT NULL,
	"sand_saves" integer DEFAULT 0 NOT NULL,
	"up_and_downs" integer DEFAULT 0 NOT NULL,
	"tournament_year" integer DEFAULT 2025,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "match_play_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_number" integer NOT NULL,
	"player1_id" integer NOT NULL,
	"player2_id" integer NOT NULL,
	"player3_id" integer NOT NULL,
	"player4_id" integer NOT NULL,
	"player1_name" varchar(100) NOT NULL,
	"player2_name" varchar(100) NOT NULL,
	"player3_name" varchar(100) NOT NULL,
	"player4_name" varchar(100) NOT NULL,
	"player1_handicap" integer NOT NULL,
	"player2_handicap" integer NOT NULL,
	"player3_handicap" integer NOT NULL,
	"player4_handicap" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "match_play_groups_group_number_unique" UNIQUE("group_number")
);
--> statement-breakpoint
CREATE TABLE "match_play_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"round" integer DEFAULT 3 NOT NULL,
	"player1_id" integer NOT NULL,
	"player2_id" integer NOT NULL,
	"group_number" integer NOT NULL,
	"hole_segment" varchar(10) NOT NULL,
	"start_hole" integer NOT NULL,
	"end_hole" integer NOT NULL,
	"handicap_difference" integer NOT NULL,
	"strokes_given" integer DEFAULT 0 NOT NULL,
	"stroke_recipient_id" integer,
	"stroke_holes" jsonb DEFAULT '[]',
	"player1_net_score" integer,
	"player2_net_score" integer,
	"winner_id" integer,
	"result" varchar(10),
	"points_awarded" jsonb DEFAULT '{"player1": 0, "player2": 0}',
	"match_status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "matchups" (
	"id" serial PRIMARY KEY NOT NULL,
	"round" integer NOT NULL,
	"player1_id" integer NOT NULL,
	"player2_id" integer,
	"player1_name" varchar(100) NOT NULL,
	"player2_name" varchar(100),
	"player1_score" integer DEFAULT 0,
	"player2_score" integer DEFAULT 0,
	"group_number" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"caption" text DEFAULT '',
	"image_url" text,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_tournament_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"tournament_year" integer NOT NULL,
	"team_partner" text NOT NULL,
	"final_ranking" integer,
	"total_points" integer DEFAULT 0,
	"round1_points" integer DEFAULT 0,
	"round2_points" integer DEFAULT 0,
	"round3_points" integer DEFAULT 0,
	"is_champion" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"vote_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"voted_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tournament_year" integer NOT NULL,
	"registered_at" timestamp DEFAULT now(),
	"entry_paid" boolean DEFAULT false,
	"entry_payment_intent_id" text,
	"entry_amount_cents" integer DEFAULT 15000,
	"ctp_round1_paid" boolean DEFAULT false,
	"ctp_round2_paid" boolean DEFAULT false,
	"ctp_round3_paid" boolean DEFAULT false,
	"ctp_payment_intent_ids" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"round1_points" integer DEFAULT 0,
	"round2_points" integer DEFAULT 0,
	"round3_points" integer DEFAULT 0,
	"match_play_points" integer DEFAULT 0,
	"total_points" integer DEFAULT 0,
	"rank" integer DEFAULT 8,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shots" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tournament_year" integer NOT NULL,
	"round" integer NOT NULL,
	"hole" integer NOT NULL,
	"shot_number" integer NOT NULL,
	"lat" numeric(10, 8),
	"lng" numeric(11, 8),
	"accuracy_meters" numeric(6, 2),
	"detected_by" text DEFAULT 'motion',
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "side_bets" (
	"id" serial PRIMARY KEY NOT NULL,
	"round" integer NOT NULL,
	"better_name" text NOT NULL,
	"opponent_name" text NOT NULL,
	"amount" integer NOT NULL,
	"condition" text NOT NULL,
	"status" text DEFAULT 'Pending',
	"result" text DEFAULT 'Pending',
	"winner_name" text,
	"witness_votes" jsonb DEFAULT '{}',
	"ready_for_resolution" boolean DEFAULT false,
	"is_team_bet" boolean DEFAULT false,
	"better_teammate" text,
	"opponent_teammate" text,
	"teammate_accepted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_number" integer NOT NULL,
	"player1_name" text NOT NULL,
	"player1_handicap" integer NOT NULL,
	"player2_name" text NOT NULL,
	"player2_handicap" integer NOT NULL,
	"player3_name" text,
	"player3_handicap" integer,
	"is_three_person_team" boolean DEFAULT false,
	"total_handicap" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "teams_team_number_unique" UNIQUE("team_number")
);
--> statement-breakpoint
CREATE TABLE "tournament_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_year" integer NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'open',
	"deadline" timestamp,
	"created_by" integer NOT NULL,
	"winning_option_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"name" text NOT NULL,
	"courses" text[] NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT false,
	"champions" text[],
	"location" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tournaments_year_unique" UNIQUE("year")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"password" varchar NOT NULL,
	"profile_picture" text,
	"handicap" integer DEFAULT 20,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vote_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"vote_id" integer NOT NULL,
	"option_text" text NOT NULL,
	"description" text,
	"image_url" text,
	"vote_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_opponent_id_users_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boozelympics_matches" ADD CONSTRAINT "boozelympics_matches_game_id_boozelympics_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."boozelympics_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boozelympics_matches" ADD CONSTRAINT "boozelympics_matches_player1_id_users_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boozelympics_matches" ADD CONSTRAINT "boozelympics_matches_player2_id_users_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boozelympics_matches" ADD CONSTRAINT "boozelympics_matches_team1_id_teams_id_fk" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boozelympics_matches" ADD CONSTRAINT "boozelympics_matches_team2_id_teams_id_fk" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boozelympics_matches" ADD CONSTRAINT "boozelympics_matches_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boozelympics_matches" ADD CONSTRAINT "boozelympics_matches_winner_team_id_teams_id_fk" FOREIGN KEY ("winner_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boozelympics_matches" ADD CONSTRAINT "boozelympics_matches_mvp_id_users_id_fk" FOREIGN KEY ("mvp_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "golf_relay_matches" ADD CONSTRAINT "golf_relay_matches_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_application_votes" ADD CONSTRAINT "guest_application_votes_application_id_guest_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."guest_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_application_votes" ADD CONSTRAINT "guest_application_votes_voter_user_id_users_id_fk" FOREIGN KEY ("voter_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_applications" ADD CONSTRAINT "guest_applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_play_groups" ADD CONSTRAINT "match_play_groups_player1_id_users_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_play_groups" ADD CONSTRAINT "match_play_groups_player2_id_users_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_play_groups" ADD CONSTRAINT "match_play_groups_player3_id_users_id_fk" FOREIGN KEY ("player3_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_play_groups" ADD CONSTRAINT "match_play_groups_player4_id_users_id_fk" FOREIGN KEY ("player4_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_play_matches" ADD CONSTRAINT "match_play_matches_player1_id_users_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_play_matches" ADD CONSTRAINT "match_play_matches_player2_id_users_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_play_matches" ADD CONSTRAINT "match_play_matches_stroke_recipient_id_users_id_fk" FOREIGN KEY ("stroke_recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_play_matches" ADD CONSTRAINT "match_play_matches_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_player1_id_users_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_player2_id_users_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_tournament_history" ADD CONSTRAINT "player_tournament_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_tournament_history" ADD CONSTRAINT "player_tournament_history_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_votes" ADD CONSTRAINT "player_votes_vote_id_tournament_votes_id_fk" FOREIGN KEY ("vote_id") REFERENCES "public"."tournament_votes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_votes" ADD CONSTRAINT "player_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_votes" ADD CONSTRAINT "player_votes_option_id_vote_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."vote_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shots" ADD CONSTRAINT "shots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_votes" ADD CONSTRAINT "tournament_votes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_options" ADD CONSTRAINT "vote_options_vote_id_tournament_votes_id_fk" FOREIGN KEY ("vote_id") REFERENCES "public"."tournament_votes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "guest_application_votes_application_voter_unique" ON "guest_application_votes" USING btree ("application_id","voter_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_votes_vote_user_unique" ON "player_votes" USING btree ("vote_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_user_year_unique" ON "registrations" USING btree ("user_id","tournament_year");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");