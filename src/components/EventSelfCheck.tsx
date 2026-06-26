import { useTalentStore } from "@/store/useTalentStore";

/**
 * 核心事件深度自查区 - 巅峰事件 / 他人反馈 / 低耗能高产出
 */
export default function EventSelfCheck() {
  const events = useTalentStore((s) => s.events);
  const setEventField = useTalentStore((s) => s.setEventField);

  const textareaClass =
    "w-full resize-none rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-white/80 outline-none transition-colors placeholder:text-white/25 focus:border-starlight/40 focus:bg-white/[0.04]";

  const labelClass =
    "mb-1.5 block text-xs font-medium tracking-wide text-white/45";

  return (
    <section id="events" className="relative z-10 mx-auto max-w-4xl px-6 py-20">
      <div className="reveal mb-14 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-starlight/60">
          CORE EVENT DEEP SELF-CHECK
        </p>
        <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
          核心事件<span className="italic text-starlight">自查</span>
        </h2>
        <p className="mt-4 text-sm text-white/40">
          填写真实经历，从事件中提炼反复出现的能力 — 那才是你的核心天赋
        </p>
      </div>

      {/* 1. 巅峰事件回溯法 */}
      <div className="reveal mb-12 rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-display text-3xl text-starlight/40">01</span>
          <div>
            <h3 className="font-serif text-xl font-semibold text-white">
              巅峰事件回溯法
            </h3>
            <p className="text-xs text-white/40">
              写下 3 件你做得特别顺手、做完有强烈成就感的事
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {events.peakEvents.map((evt, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-midnight-700/30 p-5"
            >
              <p className="mb-3 text-sm font-medium text-starlight/80">
                事件 {i + 1}
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelClass}>事情经过</label>
                  <textarea
                    rows={2}
                    className={textareaClass}
                    placeholder="描述这件事的背景与你做了什么…"
                    value={evt.process}
                    onChange={(e) =>
                      setEventField(`peakEvents.${i}.process`, e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>最得心应手的环节</label>
                  <textarea
                    rows={2}
                    className={textareaClass}
                    placeholder="哪个部分让你觉得最顺手？"
                    value={evt.bestPart}
                    onChange={(e) =>
                      setEventField(`peakEvents.${i}.bestPart`, e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>用到的核心能力</label>
                  <textarea
                    rows={2}
                    className={textareaClass}
                    placeholder="从中能提炼出哪些能力？"
                    value={evt.ability}
                    onChange={(e) =>
                      setEventField(`peakEvents.${i}.ability`, e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 他人反馈镜像法 */}
      <div className="reveal mb-12 rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-display text-3xl text-starlight/40">02</span>
          <div>
            <h3 className="font-serif text-xl font-semibold text-white">
              他人反馈镜像法
            </h3>
            <p className="text-xs text-white/40">
              从他人的求助与夸赞中，照见自己的天赋
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              身边人最常找我帮忙的 3 件事
            </label>
            <textarea
              rows={3}
              className={textareaClass}
              placeholder={"① …\n② …\n③ …"}
              value={events.othersFeedback.helpRequests}
              onChange={(e) =>
                setEventField("othersFeedback.helpRequests", e.target.value)
              }
            />
          </div>
          <div>
            <label className={labelClass}>
              别人最常夸赞我的 3 个特质
            </label>
            <textarea
              rows={3}
              className={textareaClass}
              placeholder={"① …\n② …\n③ …"}
              value={events.othersFeedback.praises}
              onChange={(e) =>
                setEventField("othersFeedback.praises", e.target.value)
              }
            />
          </div>
          <div>
            <label className={labelClass}>
              这些求助 / 夸赞背后，对应的核心能力
            </label>
            <textarea
              rows={2}
              className={textareaClass}
              placeholder="提炼出反复出现的能力关键词…"
              value={events.othersFeedback.abilities}
              onChange={(e) =>
                setEventField("othersFeedback.abilities", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* 3. 低耗能高产出验证法 */}
      <div className="reveal rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-display text-3xl text-starlight/40">03</span>
          <div>
            <h3 className="font-serif text-xl font-semibold text-white">
              低耗能高产出验证法
            </h3>
            <p className="text-xs text-white/40">
              不费力却做得好的事，往往指向天然天赋
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              没刻意努力却比多数人做得好的事
            </label>
            <textarea
              rows={2}
              className={textareaClass}
              placeholder="那件让你觉得「这有什么难」的事…"
              value={events.lowEnergyHighOutput.naturalTalent}
              onChange={(e) =>
                setEventField(
                  "lowEnergyHighOutput.naturalTalent",
                  e.target.value
                )
              }
            />
          </div>
          <div>
            <label className={labelClass}>
              做什么事时最容易进入「心流」、忘记时间
            </label>
            <textarea
              rows={2}
              className={textareaClass}
              placeholder="回神才发现几小时过去了的事…"
              value={events.lowEnergyHighOutput.flowState}
              onChange={(e) =>
                setEventField(
                  "lowEnergyHighOutput.flowState",
                  e.target.value
                )
              }
            />
          </div>
          <div>
            <label className={labelClass}>
              做完成就感强、几乎不觉得疲惫的事
            </label>
            <textarea
              rows={2}
              className={textareaClass}
              placeholder="做完反而更有能量的事…"
              value={events.lowEnergyHighOutput.fulfilling}
              onChange={(e) =>
                setEventField(
                  "lowEnergyHighOutput.fulfilling",
                  e.target.value
                )
              }
            />
          </div>
          <div>
            <label className={labelClass}>
              以上场景背后，对应的核心能力
            </label>
            <textarea
              rows={2}
              className={textareaClass}
              placeholder="提炼出核心能力关键词…"
              value={events.lowEnergyHighOutput.abilities}
              onChange={(e) =>
                setEventField(
                  "lowEnergyHighOutput.abilities",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
