"use client";
import { createContext, useContext, useEffect, useState } from "react";
type Language = "en" | "vi";
const LocaleContext = createContext<{language:Language;setLanguage:(v:Language)=>void}>({language:"en",setLanguage:()=>{}});
export function LocaleProvider({children}:{children:React.ReactNode}) {
  const [language,setLanguage]=useState<Language>("en");
  useEffect(()=>{const saved=localStorage.getItem("tb-language");if(saved==="vi")setLanguage(saved);},[]);
  function change(value:Language){setLanguage(value);localStorage.setItem("tb-language",value);}
  useEffect(()=>{document.documentElement.lang=language;},[language]);
  return <LocaleContext.Provider value={{language,setLanguage:change}}>{children}</LocaleContext.Provider>;
}
export function useLocale(){const locale=useContext(LocaleContext);return {...locale,t:(en:string,vi:string)=>locale.language==="vi"?vi:en};}
export function LanguageSwitch(){const {language,setLanguage}=useLocale();return <button className="btn btn-ghost language-switch" aria-label="Change language" onClick={()=>setLanguage(language==="en"?"vi":"en")}>{language==="en"?"EN / VI":"VI / EN"}</button>;}
