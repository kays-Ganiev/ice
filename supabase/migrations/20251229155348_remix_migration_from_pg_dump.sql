CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: subscription_plan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_plan AS ENUM (
    'free',
    'water',
    'glacicer'
);


--
-- Name: handle_new_user_credits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_credits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the user's email
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
    
    -- Check if this is the test account with unlimited credits
    IF user_email = 'test@gmail.com' THEN
        INSERT INTO public.user_credits (user_id, credits_remaining, daily_credits, is_unlimited)
        VALUES (NEW.id, 999999, 999999, true);
    ELSE
        INSERT INTO public.user_credits (user_id, credits_remaining, daily_credits)
        VALUES (NEW.id, 10, 10);
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    transaction_type text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT credit_transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['usage'::text, 'daily_grant'::text, 'monthly_grant'::text, 'subscription'::text, 'manual'::text])))
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan public.subscription_plan DEFAULT 'free'::public.subscription_plan NOT NULL,
    price_cents integer DEFAULT 0 NOT NULL,
    credits_per_month integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_credits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credits_remaining integer DEFAULT 10 NOT NULL,
    daily_credits integer DEFAULT 10 NOT NULL,
    monthly_credits integer DEFAULT 0 NOT NULL,
    plan public.subscription_plan DEFAULT 'free'::public.subscription_plan NOT NULL,
    is_unlimited boolean DEFAULT false NOT NULL,
    last_daily_reset timestamp with time zone DEFAULT now(),
    last_monthly_reset timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: websites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.websites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    prompt text NOT NULL,
    code text NOT NULL,
    is_public boolean DEFAULT false,
    share_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: credit_transactions credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);


--
-- Name: websites websites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_pkey PRIMARY KEY (id);


--
-- Name: websites websites_share_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_share_id_key UNIQUE (share_id);


--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_credits update_user_credits_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: websites update_websites_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON public.websites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: websites websites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: websites Anyone can view public websites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public websites" ON public.websites FOR SELECT USING ((is_public = true));


--
-- Name: user_credits System can insert credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert credits" ON public.user_credits FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: websites Users can create own websites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own websites" ON public.websites FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: websites Users can delete own websites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own websites" ON public.websites FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: subscriptions Users can insert own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: credit_transactions Users can insert own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own transactions" ON public.credit_transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_credits Users can update own credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own credits" ON public.user_credits FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: subscriptions Users can update own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: websites Users can update own websites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own websites" ON public.websites FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_credits Users can view own credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: subscriptions Users can view own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: credit_transactions Users can view own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: websites Users can view own websites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own websites" ON public.websites FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: credit_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

--
-- Name: websites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;