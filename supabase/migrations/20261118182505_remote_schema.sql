SET local check_function_bodies = off;

SELECT cron.unschedule('bookingpro-notify');

REVOKE ALL ON FUNCTION "extensions"."cash_dist"(money, money) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."cash_dist"(money, money) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."cash_dist"(money, money) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."date_dist"(date, date) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."date_dist"(date, date) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."date_dist"(date, date) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."float4_dist"(real, real) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."float4_dist"(real, real) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."float4_dist"(real, real) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."float8_dist"(double precision, double precision) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."float8_dist"(double precision, double precision) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."float8_dist"(double precision, double precision) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_consistent"(internal, bit, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_consistent"(internal, bit, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_consistent"(internal, bit, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bit_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_consistent"(internal, boolean, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_consistent"(internal, boolean, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_consistent"(internal, boolean, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_same"(extensions.gbtreekey2, extensions.gbtreekey2, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_same"(extensions.gbtreekey2, extensions.gbtreekey2, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_same"(extensions.gbtreekey2, extensions.gbtreekey2, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bool_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bpchar_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bpchar_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bpchar_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bpchar_consistent"(internal, character, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bpchar_consistent"(internal, character, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bpchar_consistent"(internal, character, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_consistent"(internal, bytea, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_consistent"(internal, bytea, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_consistent"(internal, bytea, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_bytea_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_consistent"(internal, money, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_consistent"(internal, money, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_consistent"(internal, money, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_distance"(internal, money, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_distance"(internal, money, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_distance"(internal, money, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_cash_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_consistent"(internal, date, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_consistent"(internal, date, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_consistent"(internal, date, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_distance"(internal, date, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_distance"(internal, date, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_distance"(internal, date, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_date_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_decompress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_decompress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_decompress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_consistent"(internal, anyenum, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_consistent"(internal, anyenum, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_consistent"(internal, anyenum, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_enum_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_consistent"(internal, real, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_consistent"(internal, real, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_consistent"(internal, real, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_distance"(internal, real, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_distance"(internal, real, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_distance"(internal, real, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float4_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_consistent"(internal, double precision, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_consistent"(internal, double precision, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_consistent"(internal, double precision, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_distance"(internal, double precision, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_distance"(internal, double precision, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_distance"(internal, double precision, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_float8_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_consistent"(internal, inet, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_consistent"(internal, inet, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_consistent"(internal, inet, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_inet_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_consistent"(internal, smallint, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_consistent"(internal, smallint, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_consistent"(internal, smallint, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_distance"(internal, smallint, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_distance"(internal, smallint, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_distance"(internal, smallint, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_same"(extensions.gbtreekey4, extensions.gbtreekey4, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_same"(extensions.gbtreekey4, extensions.gbtreekey4, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_same"(extensions.gbtreekey4, extensions.gbtreekey4, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int2_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_consistent"(internal, integer, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_consistent"(internal, integer, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_consistent"(internal, integer, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_distance"(internal, integer, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_distance"(internal, integer, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_distance"(internal, integer, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int4_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_consistent"(internal, bigint, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_consistent"(internal, bigint, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_consistent"(internal, bigint, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_distance"(internal, bigint, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_distance"(internal, bigint, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_distance"(internal, bigint, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_int8_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_consistent"(internal, interval, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_consistent"(internal, interval, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_consistent"(internal, interval, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_decompress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_decompress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_decompress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_distance"(internal, interval, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_distance"(internal, interval, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_distance"(internal, interval, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_same"(extensions.gbtreekey32, extensions.gbtreekey32, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_same"(extensions.gbtreekey32, extensions.gbtreekey32, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_same"(extensions.gbtreekey32, extensions.gbtreekey32, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_intv_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_consistent"(internal, macaddr8, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_consistent"(internal, macaddr8, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_consistent"(internal, macaddr8, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad8_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_consistent"(internal, macaddr, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_consistent"(internal, macaddr, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_consistent"(internal, macaddr, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_macad_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_consistent"(internal, numeric, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_consistent"(internal, numeric, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_consistent"(internal, numeric, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_numeric_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_consistent"(internal, oid, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_consistent"(internal, oid, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_consistent"(internal, oid, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_distance"(internal, oid, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_distance"(internal, oid, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_distance"(internal, oid, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_same"(extensions.gbtreekey8, extensions.gbtreekey8, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_oid_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_consistent"(internal, text, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_consistent"(internal, text, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_consistent"(internal, text, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_same"(extensions.gbtreekey_var, extensions.gbtreekey_var, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_text_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_consistent"(internal, time WITHOUT time zone, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_consistent"(internal, time WITHOUT time zone, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_consistent"(internal, time WITHOUT time zone, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_distance"(internal, time WITHOUT time zone, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_distance"(internal, time WITHOUT time zone, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_distance"(internal, time WITHOUT time zone, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_time_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_timetz_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_timetz_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_timetz_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_timetz_consistent"(internal, time WITH time zone, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_timetz_consistent"(internal, time WITH time zone, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_timetz_consistent"(internal, time WITH time zone, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_consistent"(internal, timestamp WITHOUT time zone, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_consistent"(internal, timestamp WITHOUT time zone, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_consistent"(internal, timestamp WITHOUT time zone, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_distance"(internal, timestamp WITHOUT time zone, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_distance"(internal, timestamp WITHOUT time zone, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_distance"(internal, timestamp WITHOUT time zone, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_same"(extensions.gbtreekey16, extensions.gbtreekey16, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_ts_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_consistent"(internal, timestamp WITH time zone, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_consistent"(internal, timestamp WITH time zone, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_consistent"(internal, timestamp WITH time zone, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_distance"(internal, timestamp WITH time zone, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_distance"(internal, timestamp WITH time zone, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_tstz_distance"(internal, timestamp WITH time zone, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_compress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_compress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_compress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_consistent"(internal, uuid, smallint, oid, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_consistent"(internal, uuid, smallint, oid, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_consistent"(internal, uuid, smallint, oid, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_penalty"(internal, internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_penalty"(internal, internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_penalty"(internal, internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_picksplit"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_picksplit"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_picksplit"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_same"(extensions.gbtreekey32, extensions.gbtreekey32, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_same"(extensions.gbtreekey32, extensions.gbtreekey32, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_same"(extensions.gbtreekey32, extensions.gbtreekey32, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_union"(internal, internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_union"(internal, internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_uuid_union"(internal, internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_var_decompress"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_var_decompress"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_var_decompress"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbt_var_fetch"(internal) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbt_var_fetch"(internal) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbt_var_fetch"(internal) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey16_in"(cstring) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey16_in"(cstring) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey16_in"(cstring) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey16_out"(extensions.gbtreekey16) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey16_out"(extensions.gbtreekey16) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey16_out"(extensions.gbtreekey16) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey2_in"(cstring) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey2_in"(cstring) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey2_in"(cstring) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey2_out"(extensions.gbtreekey2) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey2_out"(extensions.gbtreekey2) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey2_out"(extensions.gbtreekey2) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey32_in"(cstring) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey32_in"(cstring) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey32_in"(cstring) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey32_out"(extensions.gbtreekey32) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey32_out"(extensions.gbtreekey32) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey32_out"(extensions.gbtreekey32) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey4_in"(cstring) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey4_in"(cstring) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey4_in"(cstring) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey4_out"(extensions.gbtreekey4) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey4_out"(extensions.gbtreekey4) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey4_out"(extensions.gbtreekey4) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey8_in"(cstring) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey8_in"(cstring) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey8_in"(cstring) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey8_out"(extensions.gbtreekey8) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey8_out"(extensions.gbtreekey8) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey8_out"(extensions.gbtreekey8) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey_var_in"(cstring) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey_var_in"(cstring) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey_var_in"(cstring) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey_var_out"(extensions.gbtreekey_var) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey_var_out"(extensions.gbtreekey_var) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."gbtreekey_var_out"(extensions.gbtreekey_var) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."int2_dist"(smallint, smallint) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."int2_dist"(smallint, smallint) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."int2_dist"(smallint, smallint) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."int4_dist"(integer, integer) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."int4_dist"(integer, integer) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."int4_dist"(integer, integer) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."int8_dist"(bigint, bigint) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."int8_dist"(bigint, bigint) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."int8_dist"(bigint, bigint) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."interval_dist"(interval, interval) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."interval_dist"(interval, interval) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."interval_dist"(interval, interval) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."oid_dist"(oid, oid) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."oid_dist"(oid, oid) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."oid_dist"(oid, oid) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."time_dist"(time WITHOUT time zone, time WITHOUT time zone) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."time_dist"(time WITHOUT time zone, time WITHOUT time zone) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."time_dist"(time WITHOUT time zone, time WITHOUT time zone) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."ts_dist"(timestamp WITHOUT time zone, timestamp WITHOUT time zone) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."ts_dist"(timestamp WITHOUT time zone, timestamp WITHOUT time zone) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."ts_dist"(timestamp WITHOUT time zone, timestamp WITHOUT time zone) FROM "service_role";

REVOKE ALL ON FUNCTION "extensions"."tstz_dist"(timestamp WITH time zone, timestamp WITH time zone) FROM "anon";

REVOKE ALL ON FUNCTION "extensions"."tstz_dist"(timestamp WITH time zone, timestamp WITH time zone) FROM "authenticated";

REVOKE ALL ON FUNCTION "extensions"."tstz_dist"(timestamp WITH time zone, timestamp WITH time zone) FROM "service_role";

COMMENT ON EXTENSION "pg_net" IS NULL;

DROP POLICY "owner_access_businesses_select" ON "public"."businesses";

DROP POLICY "owner_delete_business" ON "public"."businesses";

DROP POLICY "owner_insert_business" ON "public"."businesses";

DROP POLICY "owner_update_business_settings" ON "public"."businesses";

DROP POLICY "tenant_insert_client_negotiated_prices" ON "public"."client_negotiated_prices";

DROP POLICY "tenant_insert_data_exports" ON "public"."data_exports";

DROP POLICY "tenant_access_expense_receipts" ON "public"."expense_receipts";

DROP POLICY "tenant_insert_expenses" ON "public"."expenses";

DROP POLICY "ic_members_delete" ON "public"."inspection_checklists";

DROP POLICY "ic_members_insert" ON "public"."inspection_checklists";

DROP POLICY "ic_members_select" ON "public"."inspection_checklists";

DROP POLICY "ic_members_update" ON "public"."inspection_checklists";

DROP POLICY "tenant_insert_inventory_items" ON "public"."inventory_items";

DROP POLICY "tenant_insert_inventory_rolls" ON "public"."inventory_rolls";

DROP POLICY "job_inspections_member_all" ON "public"."job_inspections";

DROP POLICY "jobs_member_all" ON "public"."jobs";

DROP POLICY "authenticated_read_active_plans" ON "public"."plans";

DROP TRIGGER "trg_enforce_appointments_limit" ON "public"."appointments";

DROP TRIGGER "trg_enforce_plan_immutability" ON "public"."businesses";

DROP TRIGGER "tr_audit_clients" ON "public"."clients";

DROP TRIGGER "tr_link_owner_employee" ON "public"."employees";

DROP TRIGGER "trg_enforce_employees_limit" ON "public"."employees";

DROP TRIGGER "tr_audit_jobs" ON "public"."jobs";

DROP TRIGGER "trg_jobs_tracking_expiry" ON "public"."jobs";

DROP TRIGGER "trg_enforce_workstations_limit" ON "public"."workstations";

DROP INDEX "public"."idx_audit_logs_business_created";

DROP INDEX "public"."idx_audit_logs_entity";

DROP INDEX "public"."idx_inspection_checklists_vehicle";

DROP INDEX "public"."idx_vehicles_body_type";

DROP INDEX "public"."idx_vehicles_client";

DROP INDEX "public"."uq_businesses_slug";

DROP INDEX "public"."uq_jobs_tracking_token";

DROP INDEX "public"."uq_vehicles_business_license_plate";

ALTER TABLE "public"."businesses"
  DROP CONSTRAINT "businesses_plan_check";

ALTER TABLE "public"."client_negotiated_prices"
  DROP CONSTRAINT "client_negotiated_prices_body_type_id_fkey";

ALTER TABLE "public"."client_negotiated_prices"
  DROP CONSTRAINT "client_negotiated_prices_business_id_fkey";

ALTER TABLE "public"."client_negotiated_prices"
  DROP CONSTRAINT "client_negotiated_prices_client_id_fkey";

ALTER TABLE "public"."client_negotiated_prices"
  DROP CONSTRAINT "client_negotiated_prices_service_id_fkey";

ALTER TABLE "public"."data_exports"
  DROP CONSTRAINT "data_exports_business_id_fkey";

ALTER TABLE "public"."data_exports"
  DROP CONSTRAINT "data_exports_requested_by_fkey";

ALTER TABLE "public"."expense_receipts"
  DROP CONSTRAINT "expense_receipts_expense_id_fkey";

ALTER TABLE "public"."expenses"
  DROP CONSTRAINT "expenses_business_id_fkey";

ALTER TABLE "public"."expenses"
  DROP CONSTRAINT "expenses_created_by_fkey";

ALTER TABLE "public"."inspection_checklists"
  DROP CONSTRAINT "inspection_checklists_share_token_key";

ALTER TABLE "public"."service_body_type_prices"
  DROP CONSTRAINT "service_body_type_prices_body_type_id_fkey";

ALTER TABLE "public"."service_body_type_prices"
  DROP CONSTRAINT "service_body_type_prices_service_id_fkey";

ALTER TABLE "public"."service_cost_private"
  DROP CONSTRAINT "service_cost_private_business_id_fkey";

ALTER TABLE "public"."service_cost_private"
  DROP CONSTRAINT "service_cost_private_service_id_fkey";

ALTER TABLE "public"."vehicles"
  DROP CONSTRAINT "vehicles_body_type_id_fkey";

ALTER TABLE "public"."whatsapp_templates"
  DROP CONSTRAINT "whatsapp_templates_business_id_fkey";

DROP FUNCTION "public"."_audit_appointment_label"(jsonb);

DROP FUNCTION "public"."_audit_client_name"(uuid);

DROP FUNCTION "public"."_audit_employee_name"(uuid);

DROP FUNCTION "public"."_audit_workstation_name"(uuid);

DROP FUNCTION "public"."business_has_feature"(uuid, text);

DROP FUNCTION "public"."enforce_appointments_limit"();

DROP FUNCTION "public"."enforce_employees_limit"();

DROP FUNCTION "public"."enforce_plan_immutability"();

DROP FUNCTION "public"."enforce_workstations_limit"();

DROP FUNCTION "public"."get_plan_features"(uuid);

DROP FUNCTION "public"."link_owner_employee"();

DROP FUNCTION "public"."set_job_tracking_expiry"();

ALTER TABLE "public"."audit_logs"
  DROP COLUMN "actor_label";

ALTER TABLE "public"."audit_logs"
  DROP COLUMN "actor_type";

ALTER TABLE "public"."audit_logs"
  DROP COLUMN "new_values";

ALTER TABLE "public"."audit_logs"
  DROP COLUMN "old_values";

ALTER TABLE "public"."inspection_checklists"
  DROP COLUMN "client_signature_data_url";

ALTER TABLE "public"."inspection_checklists"
  DROP COLUMN "client_signed_at";

ALTER TABLE "public"."inspection_checklists"
  DROP COLUMN "intervention_pdf_url";

ALTER TABLE "public"."inspection_checklists"
  DROP COLUMN "share_expires_at";

ALTER TABLE "public"."inspection_checklists"
  DROP COLUMN "share_revoked_at";

ALTER TABLE "public"."inspection_checklists"
  DROP COLUMN "share_token";

ALTER TABLE "public"."jobs"
  DROP COLUMN "tracking_expires_at";

ALTER TABLE "public"."jobs"
  DROP COLUMN "tracking_revoked_at";

ALTER TABLE "public"."plans"
  DROP COLUMN "data_export_enabled";

ALTER TABLE "public"."plans"
  DROP COLUMN "expenses_enabled";

ALTER TABLE "public"."plans"
  DROP COLUMN "inventory_rolls_enabled";

ALTER TABLE "public"."plans"
  DROP COLUMN "negotiated_prices_enabled";

ALTER TABLE "public"."plans"
  DROP COLUMN "workstations_limit";

ALTER TABLE "public"."vehicles"
  DROP COLUMN "body_type_id";

ALTER TABLE "public"."vehicles"
  DROP COLUMN "license_plate";

DROP TABLE "public"."client_negotiated_prices";

DROP FUNCTION "public"."enforce_cnp_cross_tenant"();

DROP TABLE "public"."data_exports";

DROP TABLE "public"."expense_receipts";

DROP TABLE "public"."expenses";

DROP TABLE "public"."service_body_type_prices";

DROP TABLE "public"."service_cost_private";

DROP FUNCTION "public"."enforce_scp_same_business"();

DROP TABLE "public"."vehicle_body_types";

DROP TABLE "public"."whatsapp_templates";

DROP EXTENSION "pg_net";

ALTER EXTENSION "btree_gist" SET SCHEMA "public";

CREATE EXTENSION "pg_net" SCHEMA "extensions";

ALTER TABLE "public"."inspection_checklists"
  DISABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."businesses"
  ALTER COLUMN "plan" SET DEFAULT 'free'::text;

CREATE OR REPLACE FUNCTION public.anonymize_client (
  p_client_id      uuid,
  p_anonymous_name text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
begin
  update public.clients
  set
    name = p_anonymous_name,
    phone = null,
    email = null,
    notes = '[Anonymized for GDPR compliance]',
    telegram_id = null,
    viber_user_id = null,
    whatsapp_number = null,
    birthday = null
  where id = p_client_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_log_audit_event()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_old jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_new jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
  v_business_id uuid;
begin
  begin
    v_business_id := (v_row->>'business_id')::uuid;
  exception when others then
    return coalesce(new, old);
  end;

  if v_business_id is null or not exists (select 1 from public.businesses where id = v_business_id) then
    return coalesce(new, old);
  end if;

  -- Ne jamais bloquer une opération métier (suppression de compte, business, etc.) si l'audit échoue
  begin
    -- Insertion optionnelle du log d'audit
    null;
  exception when others then
    null;
  end;

  return coalesce(new, old);
end $function$;

CREATE OR REPLACE FUNCTION public.get_booked_slots (
  p_business_id uuid,
  p_date        date
)
  RETURNS TABLE (
    starts_at timestamp with time zone,
    ends_at   timestamp with time zone
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select a.starts_at, a.ends_at
  from public.appointments a
  join public.businesses b on b.id = a.business_id
  where a.business_id = p_business_id
    and (a.starts_at at time zone coalesce(b.timezone, 'UTC'))::date = p_date
    and a.status not in ('cancelled', 'no_show')
$function$;

CREATE OR REPLACE FUNCTION public.get_booked_slots (
  p_business_id uuid,
  p_date        date,
  p_employee_id uuid DEFAULT NULL::uuid
)
  RETURNS TABLE (
    starts_at timestamp with time zone,
    ends_at   timestamp with time zone
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select a.starts_at, a.ends_at
  from public.appointments a
  join public.businesses b on b.id = a.business_id
  where a.business_id = p_business_id
    and (a.starts_at at time zone coalesce(b.timezone, 'UTC'))::date = p_date
    and a.status not in ('cancelled', 'no_show')
    and (p_employee_id is null or a.employee_id = p_employee_id)
$function$;

ALTER TABLE "public"."businesses"
  ADD CONSTRAINT "businesses_plan_check" CHECK ((plan = ANY (ARRAY['free'::text, 'starter'::text, 'pro'::text, 'agency'::text])));

CREATE TRIGGER tr_audit_clients
  AFTER INSERT OR DELETE OR UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_log_audit_event();

CREATE POLICY "Users can insert audit logs for their business" ON "public"."audit_logs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((business_id IN ( SELECT businesses.id
   FROM public.businesses
  WHERE (businesses.owner_id = auth.uid()))));

CREATE POLICY "public_read_business_hours" ON "public"."business_hours"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "owner_access_businesses" ON "public"."businesses"
  FOR ALL
  TO PUBLIC
  USING ((owner_id = auth.uid()));

CREATE POLICY "Public can view active employee services" ON "public"."employee_services"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((is_active = true));

CREATE POLICY "public_read_employees_for_booking" ON "public"."employees"
  FOR SELECT
  TO PUBLIC
  USING ((is_active = true));

CREATE POLICY "Public can view inspections via tracking token" ON "public"."job_inspections"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

CREATE POLICY "Public can view jobs via tracking token" ON "public"."jobs"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

CREATE POLICY "Anyone can view active plans" ON "public"."plans"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((is_active = true));

CREATE POLICY "public_read_services_for_booking" ON "public"."services"
  FOR SELECT
  TO PUBLIC
  USING ((is_active = true));

COMMENT ON EXTENSION "pg_net" IS 'Async HTTP';

REVOKE ALL ON FUNCTION "public"."anonymize_client"(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."anonymize_client"(uuid, text) TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."anonymize_client"(uuid, text) FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."anonymize_client"(uuid, text) TO "anon";

REVOKE ALL ON FUNCTION "public"."check_slot_availability"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."check_slot_availability"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."check_slot_availability"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."check_slot_availability"() TO "anon";

REVOKE ALL ON FUNCTION "public"."check_slot_availability"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."check_slot_availability"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."fn_log_audit_event"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."fn_log_audit_event"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."fn_log_audit_event"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."fn_log_audit_event"() TO "anon";

REVOKE ALL ON FUNCTION "public"."fn_log_audit_event"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."fn_log_audit_event"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_booked_slots"(uuid, date) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_booked_slots"(uuid, date) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_booked_slots"(uuid, date) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_booked_slots"(uuid, date) TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_booked_slots"(uuid, date, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_booked_slots"(uuid, date, uuid) TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."get_booked_slots"(uuid, date, uuid) FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."get_booked_slots"(uuid, date, uuid) TO "anon";

REVOKE ALL ON FUNCTION "public"."get_tx_ids_by_item_name"(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_tx_ids_by_item_name"(uuid, text) TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."get_tx_ids_by_item_name"(uuid, text) FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."get_tx_ids_by_item_name"(uuid, text) TO "anon";

REVOKE ALL ON FUNCTION "public"."handle_new_business"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."handle_new_business"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."handle_new_business"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."handle_new_business"() TO "anon";

REVOKE ALL ON FUNCTION "public"."handle_new_business"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."handle_new_business"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "anon";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."is_admin"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_admin"(uuid) TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."is_admin"(uuid) FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."is_admin"(uuid) TO "anon";

REVOKE ALL ON FUNCTION "public"."is_member"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_member"(uuid) TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."is_member"(uuid) FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."is_member"(uuid) TO "anon";

REVOKE ALL ON FUNCTION "public"."my_business_ids"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."my_business_ids"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."my_business_ids"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."my_business_ids"() TO "anon";

REVOKE ALL ON FUNCTION "public"."protect_business_owner"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."protect_business_owner"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."protect_business_owner"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."protect_business_owner"() TO "anon";

REVOKE ALL ON FUNCTION "public"."protect_business_owner"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."protect_business_owner"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."set_receipt_number"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."set_receipt_number"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."set_receipt_number"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."set_receipt_number"() TO "anon";

REVOKE ALL ON FUNCTION "public"."set_receipt_number"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."set_receipt_number"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "anon";

REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."update_client_stats"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."update_client_stats"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."update_client_stats"() FROM "anon";

GRANT EXECUTE ON FUNCTION "public"."update_client_stats"() TO "anon";

REVOKE ALL ON FUNCTION "public"."update_client_stats"() FROM "authenticated";

GRANT EXECUTE ON FUNCTION "public"."update_client_stats"() TO "authenticated";

REVOKE ALL ON SEQUENCE "public"."receipt_seq" FROM "anon";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."receipt_seq" TO "anon";

REVOKE ALL ON TABLE "public"."activity_logs" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."activity_logs" TO "anon";

REVOKE ALL ON TABLE "public"."activity_logs" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."activity_logs" TO "authenticated";

REVOKE ALL ON TABLE "public"."appointments" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."appointments" TO "anon";

REVOKE ALL ON TABLE "public"."appointments" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."appointments" TO "authenticated";

REVOKE ALL ON TABLE "public"."audit_logs" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."audit_logs" TO "anon";

REVOKE ALL ON TABLE "public"."audit_logs" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."audit_logs" TO "authenticated";

REVOKE ALL ON TABLE "public"."business_hours" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."business_hours" TO "anon";

REVOKE ALL ON TABLE "public"."business_hours" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."business_hours" TO "authenticated";

REVOKE ALL ON TABLE "public"."business_members" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."business_members" TO "anon";

REVOKE ALL ON TABLE "public"."business_members" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."business_members" TO "authenticated";

REVOKE ALL ON TABLE "public"."businesses" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."businesses" TO "anon";

REVOKE ALL ON TABLE "public"."businesses" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."businesses" TO "authenticated";

REVOKE ALL ON TABLE "public"."clients" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."clients" TO "anon";

REVOKE ALL ON TABLE "public"."clients" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."clients" TO "authenticated";

REVOKE ALL ON TABLE "public"."consents" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."consents" TO "anon";

REVOKE ALL ON TABLE "public"."consents" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."consents" TO "authenticated";

REVOKE ALL ON TABLE "public"."employee_services" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."employee_services" TO "anon";

REVOKE ALL ON TABLE "public"."employee_services" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."employee_services" TO "authenticated";

REVOKE ALL ON TABLE "public"."employees" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."employees" TO "anon";

REVOKE ALL ON TABLE "public"."employees" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."employees" TO "authenticated";

REVOKE ALL ON TABLE "public"."inspection_checklists" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."inspection_checklists" TO "anon";

REVOKE ALL ON TABLE "public"."inspection_checklists" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."inspection_checklists" TO "authenticated";

REVOKE ALL ON TABLE "public"."inventory_items" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."inventory_items" TO "anon";

REVOKE ALL ON TABLE "public"."inventory_items" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."inventory_items" TO "authenticated";

REVOKE ALL ON TABLE "public"."inventory_movements" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."inventory_movements" TO "anon";

REVOKE ALL ON TABLE "public"."inventory_movements" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."inventory_movements" TO "authenticated";

REVOKE ALL ON TABLE "public"."inventory_rolls" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."inventory_rolls" TO "anon";

REVOKE ALL ON TABLE "public"."inventory_rolls" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."inventory_rolls" TO "authenticated";

REVOKE ALL ON TABLE "public"."invoice_lines" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."invoice_lines" TO "anon";

REVOKE ALL ON TABLE "public"."invoice_lines" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."invoice_lines" TO "authenticated";

REVOKE ALL ON TABLE "public"."invoices" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."invoices" TO "anon";

REVOKE ALL ON TABLE "public"."invoices" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."invoices" TO "authenticated";

REVOKE ALL ON TABLE "public"."job_inspections" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_inspections" TO "anon";

REVOKE ALL ON TABLE "public"."job_inspections" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."job_inspections" TO "authenticated";

REVOKE ALL ON TABLE "public"."jobs" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."jobs" TO "anon";

REVOKE ALL ON TABLE "public"."jobs" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."jobs" TO "authenticated";

REVOKE ALL ON TABLE "public"."notification_log" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notification_log" TO "anon";

REVOKE ALL ON TABLE "public"."notification_log" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notification_log" TO "authenticated";

REVOKE ALL ON TABLE "public"."payments" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payments" TO "anon";

REVOKE ALL ON TABLE "public"."payments" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payments" TO "authenticated";

REVOKE ALL ON TABLE "public"."plans" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plans" TO "anon";

REVOKE ALL ON TABLE "public"."plans" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plans" TO "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon";

REVOKE ALL ON TABLE "public"."profiles" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "authenticated";

REVOKE ALL ON TABLE "public"."quote_lines" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."quote_lines" TO "anon";

REVOKE ALL ON TABLE "public"."quote_lines" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."quote_lines" TO "authenticated";

REVOKE ALL ON TABLE "public"."quotes" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."quotes" TO "anon";

REVOKE ALL ON TABLE "public"."quotes" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."quotes" TO "authenticated";

REVOKE ALL ON TABLE "public"."services" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."services" TO "anon";

REVOKE ALL ON TABLE "public"."services" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."services" TO "authenticated";

REVOKE ALL ON TABLE "public"."transactions" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions" TO "anon";

REVOKE ALL ON TABLE "public"."transactions" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions" TO "authenticated";

REVOKE ALL ON TABLE "public"."vehicles" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."vehicles" TO "anon";

REVOKE ALL ON TABLE "public"."vehicles" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."vehicles" TO "authenticated";

REVOKE ALL ON TABLE "public"."warranties" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."warranties" TO "anon";

REVOKE ALL ON TABLE "public"."warranties" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."warranties" TO "authenticated";

REVOKE ALL ON TABLE "public"."workstations" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workstations" TO "anon";

REVOKE ALL ON TABLE "public"."workstations" FROM "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workstations" TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT, UPDATE, USAGE ON SEQUENCES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLES TO "anon";

SELECT cron.schedule_in_database('pronto-notify', '*/15 * * * *', '
  select net.http_get(
    url     := ''${NEXT_PUBLIC_APP_URL}/api/cron/notify'',
    headers := jsonb_build_object(
      ''Authorization'', ''Bearer ${CRON_SECRET}''
    )
  ) as request_id;
  ', 'postgres', NULL, true);

